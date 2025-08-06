import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  experimental: {
    // Optimize CSS for production
    optimizeCss: true,
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'claude-hub.vercel.app'],
      bodySizeLimit: '1mb',
    },
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      '@/components',
      '@/hooks', 
      '@/utils',
      '@/lib',
      '@/types'
    ],
    // Enable optimistic bundling for server components
    optimizeServerReact: true,
    // Enable server component HMR cache for development
    serverComponentsHmrCache: true,
    // Enable static generation for better performance
    // Enable optimized client router
    scrollRestoration: true,
  },

  // Image optimization
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable SWC minification for better performance
    styledComponents: true,
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Library chunk (other node_modules)
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            chunks: 'initial',
          },
          // Commons chunk (shared components)
          commons: {
            minChunks: 2,
            priority: 20,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add performance optimizations
    if (!dev) {
      // Bundle analysis plugins
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NEXT_BUILD_ID': JSON.stringify(buildId),
        })
      );
    }

    return config;
  },

  // Page extensions for better code organization
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Security and caching headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
        },
      ],
    },
    // Static assets caching
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // Enable static generation timeout
  staticPageGenerationTimeout: 120,

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    // Enable compression
    compress: true,
  }),
};

export default withBundleAnalyzer(nextConfig);
