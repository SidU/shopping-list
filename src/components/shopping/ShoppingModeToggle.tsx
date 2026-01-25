'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { CheckCircle, Trash2, RotateCcw } from 'lucide-react';

interface ShoppingModeToggleProps {
  checkedCount: number;
  totalCount: number;
  onClearChecked: () => void;
  onClearAll: () => void;
  onUncheckAll: () => void;
}

export function ShoppingModeToggle({
  checkedCount,
  totalCount,
  onClearChecked,
  onClearAll,
  onUncheckAll,
}: ShoppingModeToggleProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  if (totalCount === 0) {
    return null;
  }

  const allChecked = checkedCount === totalCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-pb">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {checkedCount} of {totalCount} items
          </div>

          <div className="flex gap-2">
            {checkedCount > 0 && !allChecked && (
              <Button variant="outline" size="sm" onClick={onUncheckAll}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}

            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant={allChecked ? 'default' : 'secondary'}
                  disabled={checkedCount === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Done Shopping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Shopping</DialogTitle>
                  <DialogDescription>
                    What would you like to do with your shopping list?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => {
                      onClearChecked();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove checked items ({checkedCount})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onUncheckAll();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Uncheck all (keep items)
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onClearAll();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear entire list
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
