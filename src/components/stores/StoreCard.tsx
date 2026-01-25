'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Store as StoreIcon, Users, ChevronRight } from 'lucide-react';
import { Store } from '@/lib/types';
import { useAuth } from '@/lib/hooks/useAuth';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const { user } = useAuth();
  const isShared = store.ownerId !== user?.id;

  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <StoreIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{store.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{store.sections.length} sections</span>
                {isShared && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Shared
                    </span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
