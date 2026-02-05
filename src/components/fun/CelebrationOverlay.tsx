'use client';

import { useEffect, useState } from 'react';
import { Confetti } from './Confetti';
import { getRandomCompletionMessage, getRandomPixelCompletionMessage } from '@/lib/utils/funMessages';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface CelebrationOverlayProps {
  show: boolean;
  onComplete?: () => void;
}

export function CelebrationOverlay({ show, onComplete }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(getRandomCompletionMessage());
  const { theme } = useTheme();
  const isPixel = theme === 'pixel';

  useEffect(() => {
    if (show) {
      setMessage(isPixel ? getRandomPixelCompletionMessage() : getRandomCompletionMessage());
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, isPixel]);

  if (!visible) return null;

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
        <div className={`text-center animate-bounce-in ${isPixel ? 'level-up' : ''}`}>
          <div className={`text-8xl mb-4 ${isPixel ? 'pixel-glow' : 'animate-pulse'}`}>{message.emoji}</div>
          <h2 className={`text-3xl font-bold text-primary mb-2 ${isPixel ? 'rainbow-text uppercase tracking-wider' : 'glow-text'}`}>
            {message.title}
          </h2>
          <p className={`text-lg text-muted-foreground ${isPixel ? 'blink-slow' : ''}`}>
            {message.subtitle}
          </p>
        </div>
      </div>
    </>
  );
}
