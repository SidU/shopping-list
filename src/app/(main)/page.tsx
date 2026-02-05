'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/lib/hooks/useStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useGeolocation, findNearestStoreByPlaces, NearbyStoreMatch } from '@/lib/hooks/useGeolocation';
import { Header } from '@/components/shared/Header';
import { StoreCard } from '@/components/stores/StoreCard';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { LoginButton } from '@/components/auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Settings, Navigation, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const { theme } = useTheme();
  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation } = useGeolocation();
  const router = useRouter();
  
  // Track state
  const [checkingNearby, setCheckingNearby] = useState(false);
  const [nearbyMatch, setNearbyMatch] = useState<NearbyStoreMatch | null>(null);
  const [checkedNearby, setCheckedNearby] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Request location on mount
  useEffect(() => {
    if (!checkedNearby && !locationLoading) {
      getLocation();
    }
  }, [checkedNearby, locationLoading, getLocation]);

  // Check for nearby stores when we have location
  useEffect(() => {
    if (
      hasNavigatedRef.current ||
      checkedNearby ||
      locationLoading ||
      storesLoading ||
      authLoading ||
      !latitude ||
      !longitude ||
      stores.length === 0
    ) {
      return;
    }

    const checkNearbyStores = async () => {
      setCheckingNearby(true);
      try {
        const match = await findNearestStoreByPlaces(
          stores.map(s => ({ id: s.id, name: s.name })),
          latitude,
          longitude,
          2 // Max 2km for auto-navigation
        );

        if (match && match.distance < 1) {
          // Within 1km - auto-navigate
          hasNavigatedRef.current = true;
          router.push(`/stores/${match.storeId}`);
        } else if (match) {
          // Show info but don't auto-navigate
          setNearbyMatch(match);
        }
      } catch (error) {
        console.error('Error checking nearby stores:', error);
      } finally {
        setCheckingNearby(false);
        setCheckedNearby(true);
      }
    };

    checkNearbyStores();
  }, [latitude, longitude, stores, storesLoading, authLoading, locationLoading, checkedNearby, router]);

  if (authLoading || storesLoading) {
    return <FullPageLoading />;
  }

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
            {/* Location status / nearby store banner */}
            {(locationLoading || checkingNearby) && (
              <div className="bg-muted/50 border rounded-lg p-3 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {locationLoading ? 'Getting your location...' : 'Checking for nearby stores...'}
                </p>
              </div>
            )}

            {nearbyMatch && !checkingNearby && (
              <Link href={`/stores/${nearbyMatch.storeId}`}>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 hover:bg-primary/15 transition-colors cursor-pointer">
                  <Navigation className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {nearbyMatch.place.name} is nearby!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nearbyMatch.distance < 1 
                        ? `${Math.round(nearbyMatch.distance * 1000)}m away`
                        : `${nearbyMatch.distance.toFixed(1)} km away`
                      }
                      {nearbyMatch.place.address && ` · ${nearbyMatch.place.address}`}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {locationError && checkedNearby && (
              <div className="bg-muted/50 border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  {locationError}. Enable location to auto-open nearby stores.
                </p>
              </div>
            )}

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
