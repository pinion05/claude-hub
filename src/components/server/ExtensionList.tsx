import { Extension } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';

interface ExtensionListProps {
  extensions: Extension[];
  className?: string;
}

/**
 * Server Component for displaying extensions in a simple list format
 * Used for static rendering and SEO optimization
 */
export async function ExtensionList({ extensions, className }: ExtensionListProps) {
  if (extensions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-mono">No extensions available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {extensions.map((extension) => (
        <article
          key={extension.id}
          className="border-b border-border last:border-b-0 py-6"
        >
          <div className="flex items-start gap-4">
            <CategoryIcon 
              category={extension.category} 
              className="text-2xl mt-1 flex-shrink-0" 
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-accent mb-2">
                    {extension.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {extension.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="accent" size="sm">
                    {extension.category}
                  </Badge>
                  
                  {extension.stars && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>⭐</span>
                      <span>{extension.stars.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {extension.tags && (
                <div className="flex flex-wrap gap-2">
                  {extension.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}