'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  actions?: ReactNode;
}

export function Header({ title, showBack = false, backHref, actions }: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isPixel = theme === 'pixel';

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b ${isPixel ? 'border-4 glow-box' : 'glow-box-subtle'}`}>
      <div className="container flex h-14 items-center gap-2 px-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={handleBack} className={`-ml-2 ${isPixel ? 'joystick-wiggle' : ''}`}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className={`font-semibold text-lg flex-1 truncate ${isPixel ? 'uppercase tracking-wider pixel-glow' : 'glitch'}`}>{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
