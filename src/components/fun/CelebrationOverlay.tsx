'use client';

import { useEffect, useState } from 'react';
import { Confetti } from './Confetti';
import { getRandomCompletionMessage } from '@/lib/utils/funMessages';

interface CelebrationOverlayProps {
  show: boolean;
  onComplete?: () => void;
}

export function CelebrationOverlay({ show, onComplete }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(getRandomCompletionMessage());

  useEffect(() => {
    if (show) {
      setMessage(getRandomCompletionMessage());
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl mb-4 animate-pulse">{message.emoji}</div>
          <h2 className="text-3xl font-bold text-primary glow-text mb-2">
            {message.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {message.subtitle}
          </p>
        </div>
      </div>
    </>
  );
}
