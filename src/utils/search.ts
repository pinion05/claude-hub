import { Extension } from '@/types';

export const searchExtensions = (
  extensions: Extension[],
  query: string
): Extension[] => {
  if (!query.trim()) return extensions;

  const normalizedQuery = query.toLowerCase().trim();
  
  return extensions.filter((ext) => {
    const searchableFields = [
      ext.name.toLowerCase(),
      ext.description.toLowerCase(),
      ext.category.toLowerCase(),
      ...(ext.tags?.map(tag => tag.toLowerCase()) || [])
    ];
    
    return searchableFields.some(field => field.includes(normalizedQuery));
  });
};

export const getSuggestions = (
  query: string,
  allSuggestions: string[]
): string[] => {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return allSuggestions
    .filter(suggestion => suggestion.toLowerCase().includes(normalizedQuery))
    .slice(0, 5); // Limit to 5 suggestions
};

export const highlightMatch = (
  text: string,
  query: string
): { text: string; highlighted: boolean }[] => {
  if (!query.trim()) return [{ text, highlighted: false }];
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part) => ({
    text: part,
    highlighted: regex.test(part)
  }));
};