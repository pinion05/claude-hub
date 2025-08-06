import { getExtensionStats } from '@/lib/server/data';

interface ExtensionStatsProps {
  className?: string;
}

/**
 * Server Component for displaying extension statistics
 * Renders on the server with fresh data
 */
export async function ExtensionStats({ className }: ExtensionStatsProps) {
  const stats = await getExtensionStats();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className || ''}`}>
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-accent">
          {stats.totalExtensions.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">Extensions</div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-accent">
          {stats.categories}
        </div>
        <div className="text-sm text-gray-400">Categories</div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-accent">
          {stats.totalStars.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">Stars</div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-accent">
          {(stats.totalDownloads / 1000000).toFixed(1)}M
        </div>
        <div className="text-sm text-gray-400">Downloads</div>
      </div>
    </div>
  );
}