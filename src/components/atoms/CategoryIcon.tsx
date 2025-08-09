import React from 'react';
import { ExtensionCategory } from '@/types';
import { getCategoryIcon } from '@/data/categories';

interface CategoryIconProps {
  category: ExtensionCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = '' }) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} role="img" aria-label={`${category} icon`}>
      {getCategoryIcon(category)}
    </span>
  );
};