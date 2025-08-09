import React from 'react';
import { ExtensionCategory } from '@/types';
import { cn } from '@/utils/classNames';
import { categoryLabels } from '@/data/extensions';

interface CategoryFilterProps {
  selectedCategory: ExtensionCategory | 'all';
  onCategoryChange: (category: ExtensionCategory | 'all') => void;
  categories: ExtensionCategory[];
  extensionCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  extensionCounts = {}
}) => {
  const allCategories: (ExtensionCategory | 'all')[] = ['all', ...categories];
  
  const totalCount = Object.values(extensionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category;
        const count = category === 'all' ? totalCount : (extensionCounts[category] || 0);
        const label = category === 'all' ? '🌟 All' : categoryLabels[category as ExtensionCategory];
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200',
              'border hover:scale-105',
              isSelected
                ? 'bg-accent text-background border-accent glow-coral'
                : 'bg-card border-border text-gray-400 hover:border-accent/50 hover:text-accent'
            )}
            aria-pressed={isSelected}
            aria-label={`Filter by ${label}`}
          >
            <span className="flex items-center gap-2">
              <span>{label}</span>
              {count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs',
                  isSelected ? 'bg-background/20' : 'bg-gray-800'
                )}>
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};