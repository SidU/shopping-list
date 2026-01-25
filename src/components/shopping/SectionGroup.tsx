'use client';

import { useState } from 'react';
import { ShoppingItem, StoreSection } from '@/lib/types';
import { ItemCard } from '@/components/items/ItemCard';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionGroupProps {
  section: StoreSection;
  items: ShoppingItem[];
  onToggleItem: (itemId: string, checked: boolean) => void;
  onDeleteItem: (itemId: string) => void;
}

export function SectionGroup({
  section,
  items,
  onToggleItem,
  onDeleteItem,
}: SectionGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const checkedCount = items.filter((item) => item.checked).length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex items-center gap-2 w-full text-left py-1 ${
          allChecked ? 'text-muted-foreground' : ''
        }`}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <h3 className="font-medium">{section.name}</h3>
        <span className="text-sm text-muted-foreground">
          {checkedCount}/{items.length}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2 pl-6">
          {items
            .sort((a, b) => {
              // Unchecked items first
              if (a.checked !== b.checked) return a.checked ? 1 : -1;
              return 0;
            })
            .map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={(checked) => onToggleItem(item.id, checked)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
