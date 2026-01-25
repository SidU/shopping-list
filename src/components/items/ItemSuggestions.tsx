'use client';

import { LearnedItem, StoreSection } from '@/lib/types';
import { TrendingUp, MapPin } from 'lucide-react';

interface ItemSuggestionsProps {
  suggestions: LearnedItem[];
  sections: StoreSection[];
  query: string;
  onSelect: (item: LearnedItem) => void;
  onAddNew: () => void;
}

export function ItemSuggestions({
  suggestions,
  sections,
  query,
  onSelect,
  onAddNew,
}: ItemSuggestionsProps) {
  if (!query.trim() && suggestions.length === 0) {
    return null;
  }

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.name || 'Unknown';
  };

  const showAddNew =
    query.trim() &&
    !suggestions.some((s) => s.name.toLowerCase() === query.toLowerCase().trim());

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border-2 border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto glow-box-subtle">
      {showAddNew && (
        <button
          type="button"
          onClick={onAddNew}
          className="w-full px-4 py-3 text-left hover:bg-accent/50 active:bg-accent flex items-center gap-2 border-b border-border"
        >
          <span className="text-primary font-medium">+ Add "{query.trim()}"</span>
          <span className="text-muted-foreground text-xs">(pick section)</span>
        </button>
      )}

      {suggestions.length > 0 && (
        <div className="py-1">
          {!query.trim() && (
            <div className="px-4 py-1 text-xs text-muted-foreground uppercase tracking-wide">
              Recent items
            </div>
          )}
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 active:bg-accent flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate capitalize font-medium">{item.name}</span>
                {item.frequency > 2 && (
                  <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {getSectionName(item.sectionId)}
              </span>
            </button>
          ))}
        </div>
      )}

      {!showAddNew && suggestions.length === 0 && query.trim() && (
        <button
          type="button"
          onClick={onAddNew}
          className="w-full px-4 py-3 text-left hover:bg-accent/50 active:bg-accent"
        >
          <span className="text-primary font-medium">+ Add "{query.trim()}"</span>
        </button>
      )}
    </div>
  );
}
