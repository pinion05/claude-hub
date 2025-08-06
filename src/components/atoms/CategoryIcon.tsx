import React from 'react';
import { ExtensionCategory } from '@/types';

interface CategoryIconProps {
  category: ExtensionCategory;
  className?: string;
}

const iconMap: Record<ExtensionCategory, string> = {
  'Development': '⚡',
  'API': '🔌',
  'Browser': '🌐',
  'Productivity': '🚀',
  'Terminal': '💻',
  'Data': '📊',
  'Mobile': '📱',
  'DevOps': '🔧',
  'CMS': '📝',
  'E-commerce': '🛒',
  'Education': '🎓'
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = '' }) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`} role="img" aria-label={`${category} icon`}>
      {iconMap[category] || '📦'}
    </span>
  );
};