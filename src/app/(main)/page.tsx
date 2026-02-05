'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/lib/hooks/useStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useGeolocation, findNearestStore } from '@/lib/hooks/useGeolocation';
import { Header } from '@/components/shared/Header';
import { StoreCard } from '@/components/stores/StoreCard';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { LoginButton } from '@/components/auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Settings, MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const { theme } = useTheme();
  const { latitude, longitude, loading: locationLoading, getLocation } = useGeolocation();
  const router = useRouter();
  
  // Track if we've already attempted auto-navigation this session
  const [autoNavAttempted, setAutoNavAttempted] = useState(false);
  const [nearestStoreInfo, setNearestStoreInfo] = useState<{ name: string; distance: number } | null>(null);
  const hasNavigatedRef = useRef(false);

  // Request location on mount
  useEffect(() => {
    if (!autoNavAttempted) {
      getLocation();
      setAutoNavAttempted(true);
    }
  }, [autoNavAttempted, getLocation]);

  // Auto-navigate to nearest store when we have both location and stores
  useEffect(() => {
    if (
      hasNavigatedRef.current ||
      locationLoading ||
      storesLoading ||
      authLoading ||
      !latitude ||
      !longitude ||
      stores.length === 0
    ) {
      return;
    }

    const nearest = findNearestStore(stores, latitude, longitude);
    
    if (nearest && nearest.distance < 1) {
      // Within 1km - auto-navigate
      hasNavigatedRef.current = true;
      router.push(`/stores/${nearest.store.id}`);
    } else if (nearest) {
      // Show info about nearest store but don't auto-navigate
      setNearestStoreInfo({
        name: nearest.store.name,
        distance: nearest.distance,
      });
    }
  }, [latitude, longitude, stores, storesLoading, authLoading, locationLoading, router]);

  if (authLoading || storesLoading) {
    return <FullPageLoading />;
  }

  const storesWithLocation = stores.filter(s => s.location);
  const storesWithoutLocation = stores.filter(s => !s.location);

  return (
    <div className={`min-h-screen bg-background ${theme === 'pixel' ? 'pixel-grid starfield' : 'grid-bg'}`}>
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
            {/* Nearest store banner */}
            {nearestStoreInfo && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
                <Navigation className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    Nearest: {nearestStoreInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nearestStoreInfo.distance.toFixed(1)} km away
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {stores.length} store{stores.length !== 1 ? 's' : ''}
                {storesWithLocation.length > 0 && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <MapPin className="w-3 h-3" />
                    {storesWithLocation.length} with location
                  </span>
                )}
              </p>
              <Link href="/stores/new">
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  New Store
                </Button>
              </Link>
            </div>

            {/* Stores with location first, then without */}
            <div className="space-y-4">
              {storesWithLocation.map((store) => (
                <StoreCard key={store.id} store={store} showLocation />
              ))}
              {storesWithoutLocation.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
