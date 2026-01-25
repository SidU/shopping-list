'use client';

import { useState, useEffect } from 'react';
import { getRandomLoadingMessage } from '@/lib/utils/funMessages';

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export function FullPageLoading() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    setMessage(getRandomLoadingMessage());

    // Change message every 2 seconds for fun
    const interval = setInterval(() => {
      setMessage(getRandomLoadingMessage());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center grid-bg gap-6">
      <div className="relative">
        <LoadingSpinner />
        <div className="absolute inset-0 animate-ping opacity-20">
          <div className="rounded-full h-8 w-8 border-2 border-primary" />
        </div>
      </div>
      <div className="font-mono text-sm text-muted-foreground animate-pulse text-center px-4">
        {message}
      </div>
    </div>
  );
}
