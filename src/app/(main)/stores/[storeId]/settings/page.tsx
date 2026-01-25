'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/hooks/useStore';
import { Header } from '@/components/shared/Header';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { StoreSectionManager } from '@/components/stores/StoreSectionManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { deleteStore } from '@/lib/firebase/firestore';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default function StoreSettingsPage({ params }: PageProps) {
  const { storeId } = use(params);
  const router = useRouter();
  const { store, loading, isOwner, update, updateSections, addSection, removeSection } =
    useStore(storeId);
  const [storeName, setStoreName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || storeName.trim() === store.name) return;
    await update({ name: storeName.trim() });
    setStoreName('');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteStore(storeId);
      router.push('/');
    } catch (err) {
      console.error('Failed to delete store:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Store Settings" showBack backHref={`/stores/${storeId}`} />

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Store Name */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Store Name</h2>
          <form onSubmit={handleUpdateName} className="flex gap-2">
            <Input
              placeholder={store.name}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <Button
              type="submit"
              disabled={!storeName.trim() || storeName.trim() === store.name}
            >
              Update
            </Button>
          </form>
        </section>

        {/* Sections */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Sections</h2>
          <p className="text-sm text-muted-foreground">
            Organize your shopping list by store sections. Reorder them to match
            your store's layout.
          </p>
          <StoreSectionManager
            sections={store.sections}
            onUpdateSections={updateSections}
            onAddSection={addSection}
            onRemoveSection={removeSection}
          />
        </section>

        {/* Delete Store */}
        {isOwner && (
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Store</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{store.name}"? This action
                    cannot be undone. All shopping list data and learned items
                    will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Store'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        )}
      </main>
    </div>
  );
}
