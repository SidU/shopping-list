'use client';

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { LearnedItem } from '../types';

interface FuseResult {
  item: LearnedItem;
  score?: number;
}

export function useFuzzySearch(items: LearnedItem[], query: string) {
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ['name'],
      threshold: 0.4,
      includeScore: true,
      sortFn: (a, b) => {
        // First sort by score (lower is better)
        const scoreDiff = (a.score || 0) - (b.score || 0);
        if (Math.abs(scoreDiff) > 0.1) return scoreDiff;

        // Then by frequency (higher is better)
        const freqA = (a.item as unknown as FuseResult).item?.frequency || 0;
        const freqB = (b.item as unknown as FuseResult).item?.frequency || 0;
        return freqB - freqA;
      },
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // When no query, return most frequent items
      return [...items]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);
    }

    const searchResults = fuse.search(query);
    return searchResults.slice(0, 8).map((result) => result.item);
  }, [fuse, items, query]);

  return results;
}
