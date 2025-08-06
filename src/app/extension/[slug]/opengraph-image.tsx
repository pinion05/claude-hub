import { ImageResponse } from 'next/og';
import { getAllExtensions } from '@/lib/server/data';

export const runtime = 'edge';
export const alt = 'Claude Hub - Extension Details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ExtensionOGImage({ params }: Props) {
  const { slug } = await params;
  
  // Find the extension by slug
  const extensions = await getAllExtensions();
  const extension = extensions.find(ext => 
    ext.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );

  if (!extension) {
    // Fallback image for non-existent extensions
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
            color: '#F5F5F5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>Extension Not Found</div>
          <div style={{ fontSize: '20px', color: '#A0A0A0' }}>Explore Claude Hub for more extensions</div>
        </div>
      ),
      { ...size }
    );
  }

  // Category-specific colors
  const categoryColors: Record<string, { primary: string; secondary: string; accent: string }> = {
    Development: { primary: '#10B981', secondary: '#34D399', accent: '#064E3B' },
    API: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#1E3A8A' },
    Browser: { primary: '#F59E0B', secondary: '#FBBF24', accent: '#92400E' },
    Productivity: { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#5B21B6' },
    Automation: { primary: '#EF4444', secondary: '#F87171', accent: '#DC2626' },
    Gaming: { primary: '#EC4899', secondary: '#F472B6', accent: '#BE185D' },
    Education: { primary: '#06B6D4', secondary: '#22D3EE', accent: '#0E7490' },
    Communication: { primary: '#84CC16', secondary: '#A3E635', accent: '#365314' },
    Entertainment: { primary: '#F97316', secondary: '#FB923C', accent: '#9A3412' },
    Utility: { primary: '#6366F1', secondary: '#818CF8', accent: '#3730A3' },
    Business: { primary: '#059669', secondary: '#10B981', accent: '#064E3B' },
  };

  const colors = categoryColors[extension.category] || categoryColors.Development;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0B',
          background: `linear-gradient(135deg, ${colors?.accent || '#FF6B6B'} 0%, #1F2937 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background effects */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, ${colors?.primary || '#FF6B6B'}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${colors?.secondary || '#4ECDC4'}20 0%, transparent 50%)`,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: colors?.primary || '#FF6B6B',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              C
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#F5F5F5',
              }}
            >
              Claude Hub
            </div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              backgroundColor: colors?.primary || '#FF6B6B',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
            }}
          >
            {extension.category}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Extension icon/emoji */}
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: colors?.primary || '#FF6B6B',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              fontSize: '48px',
              boxShadow: `0 20px 40px ${colors?.primary || '#FF6B6B'}30`,
            }}
          >
            {getCategoryIcon(extension.category)}
          </div>

          {/* Extension name */}
          <div
            style={{
              fontSize: '44px',
              fontWeight: 'bold',
              color: '#F5F5F5',
              marginBottom: '20px',
              lineHeight: '1.1',
            }}
          >
            {extension.name}
          </div>

          {/* Extension description */}
          <div
            style={{
              fontSize: '20px',
              color: '#A0A0A0',
              marginBottom: '40px',
              maxWidth: '800px',
              lineHeight: '1.4',
            }}
          >
            {extension.description}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {extension.stars && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '20px' }}>⭐</div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: colors?.secondary || '#4ECDC4',
                  }}
                >
                  {extension.stars.toLocaleString()}
                </div>
              </div>
            )}

            {extension.downloads && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '20px' }}>📥</div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: colors?.secondary || '#4ECDC4',
                  }}
                >
                  {extension.downloads > 1000 
                    ? `${Math.round(extension.downloads / 1000)}K` 
                    : extension.downloads.toLocaleString()
                  }
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontSize: '20px' }}>🆓</div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#10B981',
                }}
              >
                Free
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            fontSize: '16px',
            color: '#6B7280',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Discover more extensions at claude-hub.vercel.app
        </div>
      </div>
    ),
    { ...size }
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