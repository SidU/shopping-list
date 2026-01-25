'use client';

import { ShoppingItem } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: ShoppingItem;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

export function ItemCard({ item, onToggle, onDelete }: ItemCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        item.checked ? 'bg-muted/50 border-muted' : 'bg-background'
      }`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
        className="w-6 h-6"
      />
      <span
        className={`flex-1 capitalize ${
          item.checked ? 'text-muted-foreground line-through' : ''
        }`}
      >
        {item.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
