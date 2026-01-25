'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';

type SoundType =
  | 'check'
  | 'uncheck'
  | 'add'
  | 'delete'
  | 'success'
  | 'click'
  | 'error'
  | 'swoosh'
  | 'powerUp'
  | 'powerDown';

interface SoundContextType {
  play: (sound: SoundType) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_KEY = 'shopping-list-sound-enabled';

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [mounted, setMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    setEnabledState(saved !== 'false');
    setMounted(true);
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    delay: number = 0
  ) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    } catch {
      // Ignore
    }
  }, [getAudioContext]);

  const playNoise = useCallback((duration: number, volume: number = 0.1) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      source.start();
    } catch {
      // Ignore
    }
  }, [getAudioContext]);

  const play = useCallback((sound: SoundType) => {
    if (!enabled) return;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      switch (sound) {
        case 'check':
        case 'success':
          navigator.vibrate(10);
          break;
        case 'delete':
        case 'error':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'add':
        case 'click':
          navigator.vibrate(5);
          break;
      }
    }

    switch (sound) {
      case 'check':
        playTone(880, 0.1, 'sine', 0.2);
        playTone(1100, 0.15, 'sine', 0.15, 0.05);
        break;

      case 'uncheck':
        playTone(660, 0.1, 'sine', 0.15);
        playTone(440, 0.1, 'sine', 0.1, 0.05);
        break;

      case 'add':
        playTone(523, 0.08, 'sine', 0.2);
        playTone(784, 0.12, 'sine', 0.15, 0.04);
        break;

      case 'delete':
        playNoise(0.15, 0.08);
        playTone(330, 0.1, 'triangle', 0.15);
        playTone(220, 0.15, 'triangle', 0.1, 0.05);
        break;

      case 'success':
        playTone(523, 0.1, 'sine', 0.2);
        playTone(659, 0.1, 'sine', 0.2, 0.1);
        playTone(784, 0.15, 'sine', 0.25, 0.2);
        break;

      case 'click':
        playTone(1000, 0.03, 'square', 0.1);
        break;

      case 'error':
        playTone(200, 0.15, 'sawtooth', 0.15);
        playTone(180, 0.15, 'sawtooth', 0.1, 0.1);
        break;

      case 'swoosh':
        playNoise(0.1, 0.05);
        playTone(400, 0.1, 'sine', 0.1);
        playTone(600, 0.1, 'sine', 0.08, 0.05);
        break;

      case 'powerUp':
        playTone(220, 0.1, 'square', 0.15);
        playTone(330, 0.1, 'square', 0.15, 0.08);
        playTone(440, 0.1, 'square', 0.15, 0.16);
        playTone(550, 0.1, 'square', 0.15, 0.24);
        playTone(660, 0.15, 'square', 0.2, 0.32);
        break;

      case 'powerDown':
        playTone(660, 0.1, 'sine', 0.15);
        playTone(440, 0.1, 'sine', 0.12, 0.08);
        playTone(330, 0.15, 'sine', 0.1, 0.16);
        break;
    }
  }, [enabled, playTone, playNoise]);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(SOUND_KEY, String(value));
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SoundContext.Provider value={{ play, enabled, setEnabled }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
