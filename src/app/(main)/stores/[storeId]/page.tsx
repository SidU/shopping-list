'use client';

import { use } from 'react';
import { useStore } from '@/lib/hooks/useStore';
import { useShoppingList } from '@/lib/hooks/useShoppingList';
import { Header } from '@/components/shared/Header';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { ItemInput } from '@/components/items/ItemInput';
import { ShoppingList } from '@/components/shopping/ShoppingList';
import { ShoppingModeToggle } from '@/components/shopping/ShoppingModeToggle';
import { Button } from '@/components/ui/button';
import { Settings, Share2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default function StorePage({ params }: PageProps) {
  const { storeId } = use(params);
  const { store, loading: storeLoading } = useStore(storeId);
  const {
    items,
    learnedItems,
    loading: listLoading,
    checkedCount,
    totalCount,
    addItem,
    toggleItem,
    deleteItem,
    clearChecked,
    clearAll,
    uncheckAll,
  } = useShoppingList(storeId);

  if (storeLoading || listLoading) {
    return <FullPageLoading />;
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-medium">Store not found</h1>
          <Link href="/">
            <Button>Back to Stores</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header
        title={store.name}
        showBack
        backHref="/"
        actions={
          <div className="flex gap-1">
            <Link href={`/stores/${storeId}/share`}>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/stores/${storeId}/settings`}>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        }
      />

      <main className="container px-4 py-4 max-w-lg mx-auto">
        <div className="sticky top-14 z-30 bg-background pb-4 -mx-4 px-4">
          <ItemInput
            learnedItems={learnedItems}
            sections={store.sections}
            onAddItem={addItem}
          />
        </div>

        <ShoppingList
          items={items}
          sections={store.sections}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItem}
        />
      </main>

      <ShoppingModeToggle
        checkedCount={checkedCount}
        totalCount={totalCount}
        onClearChecked={clearChecked}
        onClearAll={clearAll}
        onUncheckAll={uncheckAll}
      />
    </div>
  );
}
