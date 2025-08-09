import { HomePage } from '@/components/templates/HomePage';
import { fetchAllExtensions, extensions as fallbackExtensions } from '@/data/extensions';
import { defaultSuggestions } from '@/data/suggestions';

export default async function Home() {
  let extensions;
  
  try {
    // Try to fetch fresh data from GitHub
    extensions = await fetchAllExtensions();
  } catch (error) {
    console.error('Failed to fetch GitHub data, using fallback:', error);
    // Use fallback data if GitHub API fails
    extensions = fallbackExtensions;
  }
  
  return (
    <HomePage 
      extensions={extensions} 
      suggestions={defaultSuggestions} 
    />
  );
}