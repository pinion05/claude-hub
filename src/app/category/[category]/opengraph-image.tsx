import { ImageResponse } from 'next/og';
import { getExtensionsByCategory, getExtensionCategories } from '@/lib/server/data';

export const runtime = 'edge';
export const alt = 'Claude Hub - Category Extensions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryOGImage({ params }: Props) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category).replace(/-/g, ' ');
  
  // Get extensions for this category
  const allCategories = getExtensionCategories();
  const matchedCategory = allCategories.find(cat => 
    cat.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
  );
  
  const extensions = matchedCategory ? 
    await getExtensionsByCategory(matchedCategory) : [];
  
  const extensionCount = extensions.length;
  const totalStars = extensions.reduce((sum, ext) => sum + (ext.stars || 0), 0);

  // Category-specific colors
  const categoryColors: Record<string, { primary: string; secondary: string; bg: string }> = {
    development: { primary: '#10B981', secondary: '#34D399', bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' },
    api: { primary: '#3B82F6', secondary: '#60A5FA', bg: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)' },
    browser: { primary: '#F59E0B', secondary: '#FBBF24', bg: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)' },
    productivity: { primary: '#8B5CF6', secondary: '#A78BFA', bg: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)' },
    automation: { primary: '#EF4444', secondary: '#F87171', bg: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' },
    default: { primary: '#FF6B6B', secondary: '#4ECDC4', bg: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)' }
  };

  const colors = categoryColors[matchedCategory?.toLowerCase() || 'default'] ?? categoryColors.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0B',
          background: colors?.bg || 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: colors?.primary || '#FF6B6B',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {getCategoryIcon(matchedCategory || 'Default')}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#F5F5F5',
              letterSpacing: '-2px',
            }}
          >
            Claude Hub
          </div>
        </div>

        {/* Category title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: colors?.primary || '#FF6B6B',
            textAlign: 'center',
            marginBottom: '20px',
            textTransform: 'capitalize',
          }}
        >
          {categoryName} Extensions
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#A0A0A0',
            textAlign: 'center',
            marginBottom: '50px',
            maxWidth: '800px',
          }}
        >
          Discover {extensionCount} {categoryName.toLowerCase()} tools and integrations for Claude AI
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '50px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: colors?.primary || '#FF6B6B',
              }}
            >
              {extensionCount}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#F5F5F5',
              }}
            >
              Extensions
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: colors?.secondary || '#4ECDC4',
              }}
            >
              {totalStars > 1000 ? `${Math.round(totalStars / 1000)}K` : totalStars}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#F5F5F5',
              }}
            >
              Total Stars
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#FFE66D',
              }}
            >
              Free
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#F5F5F5',
              }}
            >
              Open Source
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Development: '💻',
    API: '🔌',
    Browser: '🌐',
    Productivity: '⚡',
    Automation: '🤖',
    Gaming: '🎮',
    Education: '📚',
    Communication: '💬',
    Entertainment: '🎵',
    Utility: '🛠️',
    Business: '💼',
  };
  
  return icons[category] || '🔧';
}