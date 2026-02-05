'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Store as StoreIcon, Users, ChevronRight, MapPin } from 'lucide-react';
import { Store } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface StoreCardProps {
  store: Store;
  showLocation?: boolean;
}

export function StoreCard({ store, showLocation }: StoreCardProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isShared = store.ownerId !== user?.id;
  const isPixel = theme === 'pixel';
  const hasLocation = !!store.location;

  return (
    <Link href={`/stores/${store.id}`}>
      <Card className={`transition-all cursor-pointer group ${isPixel ? 'hover:power-up border-4' : 'hover:bg-accent/50 hover:shadow-[0_0_15px_var(--border)]'}`}>
        <CardContent className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all ${isPixel ? 'bg-primary/20 border-2 border-primary' : 'rounded-lg bg-primary/10 group-hover:shadow-[0_0_10px_var(--primary)]'}`}>
              <StoreIcon className={`w-5 h-5 text-primary ${isPixel ? 'joystick-wiggle' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg truncate ${isPixel ? 'uppercase tracking-wide' : 'glow-text-subtle'}`}>{store.name}</h3>
              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isPixel ? 'uppercase text-xs tracking-wider' : ''}`}>
                <span>{store.sections.length} {isPixel ? 'LVL' : 'sections'}</span>
                {isShared && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {isPixel ? 'CO-OP' : 'Shared'}
                    </span>
                  </>
                )}
                {showLocation && hasLocation && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin className="w-3 h-3" />
                      {isPixel ? 'GPS' : 'Location'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isPixel ? 'blink' : 'group-hover:translate-x-1'}`} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
