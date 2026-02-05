'use client';

import { ShoppingItem } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useSoundContext } from '@/lib/contexts/SoundContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getItemEmoji } from '@/lib/utils/emojis';

interface ItemCardProps {
  item: ShoppingItem;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

export function ItemCard({ item, onToggle, onDelete }: ItemCardProps) {
  const { play } = useSoundContext();
  const { theme } = useTheme();
  const emoji = getItemEmoji(item.name);
  const isPixel = theme === 'pixel';

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
      className={`flex items-center gap-3 p-3 border transition-all active:scale-[0.98] ${
        isPixel ? 'border-2' : 'rounded-lg'
      } ${
        item.checked
          ? `bg-muted/50 border-muted ${isPixel ? 'opacity-60' : ''}`
          : `bg-background ${isPixel ? 'hover:border-primary hover:pixel-glow-box' : 'hover:shadow-[0_0_10px_var(--border)]'}`
      }`}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) => handleToggle(checked as boolean)}
        className={`w-6 h-6 ${isPixel && item.checked ? 'coin-insert' : ''}`}
      />
      <span
        className={`flex-1 capitalize flex items-center gap-2 ${
          item.checked ? 'text-muted-foreground line-through' : ''
        } ${isPixel ? 'uppercase tracking-wide text-sm' : ''}`}
      >
        {emoji && <span className={`text-lg ${isPixel && !item.checked ? 'animate-float' : ''}`}>{emoji}</span>}
        <span>{item.name}</span>
        {isPixel && item.checked && <span className="text-xs text-accent ml-auto">+10 XP</span>}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className={`h-8 w-8 text-muted-foreground hover:text-destructive active:scale-95 ${isPixel ? 'joystick-wiggle' : ''}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
