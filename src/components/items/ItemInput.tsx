'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ItemSuggestions } from './ItemSuggestions';
import { useFuzzySearch } from '@/lib/hooks/useFuzzySearch';
import { LearnedItem, StoreSection } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useSoundContext } from '@/lib/contexts/SoundContext';

interface ItemInputProps {
  learnedItems: LearnedItem[];
  sections: StoreSection[];
  onAddItem: (name: string, sectionId: string) => void;
}

export function ItemInput({ learnedItems, sections, onAddItem }: ItemInputProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSoundContext();

  const suggestions = useFuzzySearch(learnedItems, query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: LearnedItem) => {
    play('add');
    onAddItem(item.name, item.sectionId);
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAddNew = () => {
    if (!query.trim()) return;
    play('click');
    setPendingItem(query.trim());
    setShowSectionPicker(true);
    setShowSuggestions(false);
  };

  const handleSelectSection = (sectionId: string) => {
    if (pendingItem) {
      play('add');
      onAddItem(pendingItem, sectionId);
      setPendingItem(null);
      setQuery('');
      setShowSectionPicker(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && query.trim()) {
        // Check for exact match first
        const exactMatch = suggestions.find(
          (s) => s.name.toLowerCase() === query.toLowerCase().trim()
        );
        if (exactMatch) {
          handleSelectSuggestion(exactMatch);
        } else {
          handleAddNew();
        }
      } else if (query.trim()) {
        handleAddNew();
      }
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Add an item..."
              className="pr-10 text-base"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                &times;
              </button>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleAddNew}
            disabled={!query.trim()}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showSuggestions && (query.trim() || suggestions.length > 0) && (
          <ItemSuggestions
            suggestions={suggestions}
            sections={sections}
            query={query}
            onSelect={handleSelectSuggestion}
            onAddNew={handleAddNew}
          />
        )}
      </div>

      <Dialog open={showSectionPicker} onOpenChange={setShowSectionPicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Section</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Where do you find <span className="font-medium capitalize">"{pendingItem}"</span>?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="outline"
                onClick={() => handleSelectSection(section.id)}
                className="justify-start active:scale-95"
              >
                {section.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
