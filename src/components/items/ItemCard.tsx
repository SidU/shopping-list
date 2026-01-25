'use client';

import { ShoppingItem } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useSoundContext } from '@/lib/contexts/SoundContext';
import { getItemEmoji } from '@/lib/utils/emojis';

interface ItemCardProps {
  item: ShoppingItem;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

export function ItemCard({ item, onToggle, onDelete }: ItemCardProps) {
  const { play } = useSoundContext();
  const emoji = getItemEmoji(item.name);

  const handleToggle = (checked: boolean) => {
    play(checked ? 'check' : 'uncheck');
    onToggle(checked);
  };

  const handleDelete = () => {
    play('delete');
    onDelete();
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.98] ${
        item.checked
          ? 'bg-muted/50 border-muted'
          : 'bg-background hover:shadow-[0_0_10px_var(--border)]'
      }`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) => handleToggle(checked as boolean)}
        className="w-6 h-6"
      />
      <span
        className={`flex-1 capitalize flex items-center gap-2 ${
          item.checked ? 'text-muted-foreground line-through' : ''
        }`}
      >
        {emoji && <span className="text-lg">{emoji}</span>}
        <span>{item.name}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-8 w-8 text-muted-foreground hover:text-destructive active:scale-95"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
