'use client';

import { useState } from 'react';
import { StoreSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface StoreSectionManagerProps {
  sections: StoreSection[];
  onUpdateSections: (sections: StoreSection[]) => void;
  onAddSection: (name: string) => void;
  onRemoveSection: (sectionId: string) => void;
}

export function StoreSectionManager({
  sections,
  onUpdateSections,
  onAddSection,
  onRemoveSection,
}: StoreSectionManagerProps) {
  const [newSectionName, setNewSectionName] = useState('');

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    onAddSection(newSectionName.trim());
    setNewSectionName('');
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === sectionId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order values
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx,
    }));

    onUpdateSections(reorderedSections);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddSection} className="flex gap-2">
        <Input
          placeholder="New section name..."
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />
        <Button type="submit" disabled={!newSectionName.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <Card key={section.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 font-medium">{section.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sortedSections.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSection(section.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
