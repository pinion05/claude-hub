import { HomePage } from '@/components/templates/HomePage';
import { extensions } from '@/data/extensions';
import { defaultSuggestions } from '@/data/suggestions';

export default function Home() {
  return (
    <HomePage 
      extensions={extensions} 
      suggestions={defaultSuggestions} 
    />
  );
}