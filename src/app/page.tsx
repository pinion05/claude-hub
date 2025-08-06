import { Suspense } from 'react';
import { Metadata } from 'next';
import { HomePage } from '@/components/templates/HomePage';
import { ExtensionStats } from '@/components/server/ExtensionStats';
import { StructuredData } from '@/components/seo/StructuredData';
import { getAllExtensions, getSearchSuggestions, getExtensionStats } from '@/lib/server/data';
import { Skeleton } from '@/components/atoms/Skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StateProvider } from '@/components/providers';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const stats = await getExtensionStats();
  
  return {
    title: 'Claude Hub - Discover Claude AI Extensions',
    description: `Explore ${stats.totalExtensions}+ Claude AI extensions across ${stats.categories} categories. Find development tools, browser extensions, productivity apps, and more for Claude AI.`,
    keywords: [
      'Claude AI',
      'extensions',
      'plugins',
      'development tools',
      'AI assistant',
      'productivity',
      'browser extensions',
      'API tools'
    ],
    authors: [{ name: 'Claude Hub' }],
    creator: 'Claude Hub',
    publisher: 'Claude Hub',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: 'Claude Hub - Discover Claude AI Extensions',
      description: `Explore ${stats.totalExtensions}+ Claude AI extensions across ${stats.categories} categories`,
      url: 'https://claude-hub.vercel.app',
      siteName: 'Claude Hub',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Claude Hub - Discover Claude AI Extensions',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Claude Hub - Discover Claude AI Extensions',
      description: `Explore ${stats.totalExtensions}+ Claude AI extensions`,
      images: ['/og-image.png'],
      creator: '@claudehub',
    },
    alternates: {
      canonical: 'https://claude-hub.vercel.app',
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}

// Loading component for Suspense boundary
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <Skeleton variant="text" height="32px" width="60%" className="mb-2" />
          <Skeleton variant="text" height="16px" width="80%" />
        </div>
      ))}
    </div>
  );
}

// Error boundary for stats section
function StatsError() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <div className="text-sm text-red-400">Unable to load stats</div>
      </div>
    </div>
  );
}

export default async function Home() {
  // Fetch data on the server
  const [extensions, suggestions] = await Promise.all([
    getAllExtensions(),
    getSearchSuggestions()
  ]);

  const stats = await getExtensionStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Structured data for SEO */}
      <StructuredData extensions={extensions} stats={stats} />
      
      {/* Server-rendered stats with Suspense for streaming */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <ErrorBoundary fallback={<StatsError />}>
          <Suspense fallback={<StatsLoading />}>
            <ExtensionStats className="mb-12" />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Client-side home page with error boundary */}
      <ErrorBoundary 
        fallback={
          <div className="max-w-6xl mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">Unable to load the application</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors"
            >
              Reload Page
            </button>
          </div>
        }
      >
        <StateProvider
          initialExtensions={extensions}
          initialSuggestions={suggestions}
        >
          <HomePage />
        </StateProvider>
      </ErrorBoundary>
    </div>
  );
}