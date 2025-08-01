import React from 'react';
import { cn } from '@/utils/classNames';

export interface SuggestionListProps {
  suggestions: string[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  isCompact?: boolean;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  isCompact = false
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute w-full mt-2 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-lg">
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion}-${index}`}
          type="button"
          className={cn(
            'w-full text-left cursor-pointer transition-colors font-mono text-sm',
            isCompact ? 'px-4 py-2' : 'px-6 py-3',
            index === selectedIndex 
              ? 'bg-accent/20 text-accent' 
              : 'hover:bg-accent/10'
          )}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={(e) => {
            // Visual feedback on hover without changing selection
            e.currentTarget.classList.add('bg-accent/10');
          }}
          onMouseLeave={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.classList.remove('bg-accent/10');
            }
          }}
        >
          <span className="text-accent mr-2">{'>'}</span>
          {suggestion}
        </button>
      ))}
    </div>
  );
};