import type { Metadata, Viewport } from "next";
import { Fira_Code } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StructuredData } from "@/components/seo/StructuredData";
import { QueryProvider } from "@/components/providers";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Optimize font loading
});

// Default metadata (can be overridden by pages)
export const metadata: Metadata = {
  title: {
    template: '%s | Claude Hub',
    default: 'Claude Hub - Discover Claude AI Extensions'
  },
  description: "Explore and discover extensions, tools, and integrations for Claude AI. Find development tools, browser extensions, productivity apps, and more.",
  keywords: [
    "Claude AI", 
    "Extensions", 
    "Tools", 
    "Integrations", 
    "Plugins", 
    "Development", 
    "Productivity", 
    "Browser Extensions"
  ],
  authors: [{ name: "Claude Hub Team" }],
  creator: "Claude Hub",
  publisher: "Claude Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://claude-hub.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Claude Hub - Discover Claude AI Extensions",
    description: "Explore and discover extensions, tools, and integrations for Claude AI",
    url: 'https://claude-hub.vercel.app',
    siteName: 'Claude Hub',
    locale: 'en_US',
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Claude Hub - Discover Claude AI Extensions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claude Hub - Discover Claude AI Extensions',
    description: 'Explore and discover extensions, tools, and integrations for Claude AI',
    images: ['/og-image.png'],
    creator: '@claudehub',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0B' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon and App icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <StructuredData />
      </head>
      <body
        className={`${firaCode.variable} font-mono antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to content
        </a>
        
        <ErrorBoundary>
          <QueryProvider>
            <main id="main-content">
              {children}
            </main>
          </QueryProvider>
        </ErrorBoundary>
        
        {/* Performance monitoring (optional) */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Basic performance monitoring
                if ('performance' in window) {
                  window.addEventListener('load', () => {
                    setTimeout(() => {
                      const perfData = performance.getEntriesByType('navigation')[0];
                      console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
                    }, 0);
                  });
                }
              `
            }}
          />
        )}
      </body>
    </html>
  );
}
