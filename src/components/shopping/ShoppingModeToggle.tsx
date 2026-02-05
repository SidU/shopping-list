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
import { useTheme } from '@/lib/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isPixel = theme === 'pixel';

  if (totalCount === 0) {
    return null;
  }

  const allChecked = checkedCount === totalCount;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 safe-area-pb ${isPixel ? 'border-t-4 glow-box' : 'glow-box-subtle'}`}>
      <div className="container max-w-lg mx-auto">
        {/* Pixel theme progress bar */}
        {isPixel && (
          <div className="mb-3 h-4 bg-muted border-2 border-border relative overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wider">
              {allChecked ? 'QUEST COMPLETE!' : `${progressPercent}%`}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className={`text-sm text-muted-foreground ${isPixel ? 'uppercase tracking-wider' : ''}`}>
            <span className="font-mono">
              <span className={`text-primary ${isPixel && allChecked ? 'rainbow-text' : ''}`}>{checkedCount}</span>
              <span className="text-border">/</span>
              {totalCount}
            </span>
            {isPixel ? ' XP' : ' items'}
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
                className={`active:scale-95 ${isPixel ? 'uppercase tracking-wider' : ''}`}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {isPixel ? 'Retry' : 'Reset'}
              </Button>
            )}

            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant={allChecked ? 'default' : 'secondary'}
                  disabled={checkedCount === 0}
                  onClick={() => play('click')}
                  className={`active:scale-95 ${isPixel ? 'uppercase tracking-wider' : ''} ${isPixel && allChecked ? 'power-up' : ''}`}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {isPixel ? (allChecked ? 'Victory!' : 'Menu') : 'Done'}
                </Button>
              </DialogTrigger>
              <DialogContent className={isPixel ? 'border-4' : ''}>
                <DialogHeader>
                  <DialogTitle className={isPixel ? 'uppercase tracking-wider' : ''}>
                    {isPixel ? 'Game Over' : 'Complete Shopping'}
                  </DialogTitle>
                  <DialogDescription className={isPixel ? 'uppercase text-xs tracking-wide' : ''}>
                    {isPixel ? 'Select your next action, player.' : 'What would you like to do with your shopping list?'}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => {
                      play('success');
                      onClearChecked();
                      setShowCompleteDialog(false);
                    }}
                    className={`w-full active:scale-95 ${isPixel ? 'uppercase tracking-wider pixel-button' : ''}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isPixel ? `Collect Loot (${checkedCount})` : `Remove checked (${checkedCount})`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      play('swoosh');
                      onUncheckAll();
                      setShowCompleteDialog(false);
                    }}
                    className={`w-full active:scale-95 ${isPixel ? 'uppercase tracking-wider' : ''}`}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isPixel ? 'Restart Level' : 'Uncheck all (keep items)'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      play('delete');
                      onClearAll();
                      setShowCompleteDialog(false);
                    }}
                    className={`w-full active:scale-95 ${isPixel ? 'uppercase tracking-wider' : ''}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isPixel ? 'Delete Save' : 'Clear entire list'}
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
