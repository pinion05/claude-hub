import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Claude Hub - Discover Claude AI Extensions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
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
          backgroundImage: 'radial-gradient(circle at 25% 25%, #FF6B6B 0%, transparent 50%), radial-gradient(circle at 75% 75%, #4ECDC4 0%, transparent 50%)',
          fontFamily: 'monospace',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#FF6B6B',
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
            C
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

        {/* Main Title */}
        <div
          style={{
            fontSize: '32px',
            color: '#F5F5F5',
            textAlign: 'center',
            marginBottom: '16px',
            maxWidth: '800px',
            lineHeight: '1.2',
          }}
        >
          Discover Claude AI Extensions
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#A0A0A0',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '600px',
          }}
        >
          Explore tools, integrations, and plugins for Claude AI
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#FF6B6B',
              }}
            >
              100+
            </div>
            <div
              style={{
                fontSize: '16px',
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
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#4ECDC4',
              }}
            >
              10+
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#F5F5F5',
              }}
            >
              Categories
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#FFE66D',
              }}
            >
              ∞
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#F5F5F5',
              }}
            >
              Possibilities
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