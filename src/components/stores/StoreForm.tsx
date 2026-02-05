'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStores } from '@/lib/hooks/useStore';

export function StoreForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addStore } = useStores();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const storeId = await addStore(name.trim());
      router.push(`/stores/${storeId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
