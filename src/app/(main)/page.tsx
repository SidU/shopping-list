'use client';

import { useStores } from '@/lib/hooks/useStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import { StoreCard } from '@/components/stores/StoreCard';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { LoginButton } from '@/components/auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stores, loading: storesLoading } = useStores();

  if (authLoading || storesLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header
        title="My Stores"
        actions={
          <div className="flex items-center gap-1">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <LoginButton />
          </div>
        }
      />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        {stores.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center glow-box-subtle">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium glow-text-subtle">No stores yet</h2>
              <p className="text-muted-foreground text-sm">
                Create your first store to start building your shopping list.
              </p>
            </div>
            <Link href="/stores/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Store
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {stores.length} store{stores.length !== 1 ? 's' : ''}
              </p>
              <Link href="/stores/new">
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  New Store
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
