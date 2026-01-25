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
import { useSoundContext } from '@/lib/contexts/SoundContext';

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
  const { play } = useSoundContext();

  if (totalCount === 0) {
    return null;
  }

  const allChecked = checkedCount === totalCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 safe-area-pb glow-box-subtle">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-mono">
              <span className="text-primary">{checkedCount}</span>
              <span className="text-border">/</span>
              {totalCount}
            </span>
            {' '}items
          </div>

          <div className="flex gap-2">
            {checkedCount > 0 && !allChecked && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  play('swoosh');
                  onUncheckAll();
                }}
                className="active:scale-95"
              >
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
                  onClick={() => play('click')}
                  className="active:scale-95"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Done
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
                      play('success');
                      onClearChecked();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove checked ({checkedCount})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      play('swoosh');
                      onUncheckAll();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Uncheck all (keep items)
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      play('delete');
                      onClearAll();
                      setShowCompleteDialog(false);
                    }}
                    className="w-full active:scale-95"
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
