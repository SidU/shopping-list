'use client';

import { useMemo, useState, useEffect } from 'react';
import { ShoppingItem, StoreSection } from '@/lib/types';
import { SectionGroup } from './SectionGroup';
import { getRandomEmptyMessage } from '@/lib/utils/funMessages';

interface ShoppingListProps {
  items: ShoppingItem[];
  sections: StoreSection[];
  onToggleItem: (itemId: string, checked: boolean) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ShoppingList({
  items,
  sections,
  onToggleItem,
  onDeleteItem,
}: ShoppingListProps) {
  const [emptyMessage, setEmptyMessage] = useState({ emoji: '🛒', title: '', subtitle: '' });

  useEffect(() => {
    setEmptyMessage(getRandomEmptyMessage());
  }, []);

  const itemsBySection = useMemo(() => {
    const grouped = new Map<string, ShoppingItem[]>();

    // Initialize with empty arrays for all sections
    sections.forEach((section) => {
      grouped.set(section.id, []);
    });

    // Group items by section
    items.forEach((item) => {
      const sectionItems = grouped.get(item.sectionId) || [];
      sectionItems.push(item);
      grouped.set(item.sectionId, sectionItems);
    });

    return grouped;
  }, [items, sections]);

  // Sort sections by order
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl animate-float">{emptyMessage.emoji}</div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold glow-text-subtle">{emptyMessage.title}</h2>
          <p className="text-muted-foreground text-sm">
            {emptyMessage.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedSections.map((section) => {
        const sectionItems = itemsBySection.get(section.id) || [];
        return (
          <SectionGroup
            key={section.id}
            section={section}
            items={sectionItems}
            onToggleItem={onToggleItem}
            onDeleteItem={onDeleteItem}
          />
        );
      })}
    </div>
  );
}
