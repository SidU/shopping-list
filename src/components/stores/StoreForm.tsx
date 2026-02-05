'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStores } from '@/lib/hooks/useStore';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { MapPin, Loader2, Check } from 'lucide-react';

export function StoreForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const { addStore } = useStores();
  const router = useRouter();
  const { latitude, longitude, loading: locationLoading, error: locationError, getLocation } = useGeolocation();

  const handleGetLocation = () => {
    setUseLocation(true);
    getLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const location = useLocation && latitude && longitude
        ? { latitude, longitude }
        : undefined;
      
      const storeId = await addStore(name.trim(), location);
      router.push(`/stores/${storeId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const hasLocation = useLocation && latitude && longitude;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Store name (e.g., Whole Foods, Target)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Location section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {!useLocation ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Add store location
            </Button>
          ) : locationLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting location...
            </div>
          ) : hasLocation ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              Location saved
            </div>
          ) : locationError ? (
            <div className="space-y-1">
              <p className="text-sm text-destructive">{locationError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                className="gap-2"
              >
                <MapPin className="w-4 h-4" />
                Try again
              </Button>
            </div>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Adding location helps automatically open this store when you&apos;re nearby.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Default sections will be created for you. You can customize them later.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
          {loading ? 'Creating...' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}
