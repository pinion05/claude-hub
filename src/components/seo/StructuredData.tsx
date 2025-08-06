import { Extension } from '@/types';

interface StructuredDataProps {
  extensions?: Extension[];
  stats?: {
    totalExtensions: number;
    totalStars: number;
    totalDownloads: number;
    categories: number;
  };
  pageType?: 'website' | 'search' | 'category' | 'extension';
  currentUrl?: string;
  searchQuery?: string;
  category?: string;
  extension?: Extension;
}

/**
 * Server Component that generates structured data (JSON-LD) for SEO
 */
export function StructuredData({ 
  extensions, 
  stats: _stats, 
  pageType = 'website',
  currentUrl = 'https://claude-hub.vercel.app',
  searchQuery,
  category,
  extension
}: StructuredDataProps) {
  const baseUrl = 'https://claude-hub.vercel.app';

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Claude Hub",
    "description": "Discover and explore Claude AI extensions, plugins, and tools",
    "url": baseUrl,
    "inLanguage": "en-US",
    "copyrightYear": new Date().getFullYear(),
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Claude Hub"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}?q={search_term_string}`,
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      "query-input": "required name=search_term_string"
    },
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Extensions Directory",
        "url": `${baseUrl}/extensions`,
        "description": "Browse all Claude AI extensions"
      },
      {
        "@type": "WebPage", 
        "name": "Categories",
        "url": `${baseUrl}/categories`,
        "description": "Explore extensions by category"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Claude Hub",
    "legalName": "Claude Hub",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "The comprehensive directory for Claude AI extensions and tools",
    "foundingDate": "2024",
    "knowsAbout": [
      "Claude AI",
      "Artificial Intelligence",
      "Browser Extensions",
      "Developer Tools",
      "Productivity Software",
      "API Integration"
    ],
    "sameAs": [
      "https://github.com/claude-hub",
      "https://twitter.com/claudehub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": `${baseUrl}/contact`
    }
  };

  let collectionSchema = null;
  if (extensions && extensions.length > 0) {
    collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Claude AI Extensions Directory",
      "description": `Collection of ${extensions.length} Claude AI extensions and tools`,
      "url": "https://claude-hub.vercel.app",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": extensions.length,
        "itemListElement": extensions.slice(0, 10).map((extension, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": extension.name,
            "description": extension.description,
            "applicationCategory": extension.category,
            "operatingSystem": "Any",
            "url": extension.repoUrl,
            "author": {
              "@type": "Organization",
              "name": extension.author || "Community"
            },
            ...(extension.stars && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": Math.min(5, Math.max(1, extension.stars / 1000)),
                "bestRating": 5,
                "worstRating": 1,
                "ratingCount": extension.stars
              }
            }),
            ...(extension.downloads && {
              "downloadUrl": extension.repoUrl,
              "installUrl": extension.repoUrl
            })
          }
        }))
      }
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://claude-hub.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Extensions",
        "item": "https://claude-hub.vercel.app"
      }
    ]
  };

  // Generate page-specific schemas
  const pageSchemas = [];
  
  // Search Results Page Schema
  if (pageType === 'search' && searchQuery) {
    const searchResultsSchema = {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": `Search Results for "${searchQuery}"`,
      "description": `Search results for "${searchQuery}" on Claude Hub`,
      "url": `${baseUrl}?q=${encodeURIComponent(searchQuery)}`,
      "mainContentOfPage": {
        "@type": "WebPageElement",
        "cssSelector": "#search-results"
      },
      ...(extensions && {
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": extensions.length,
          "itemListElement": extensions.slice(0, 5).map((ext, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "SoftwareApplication",
              "name": ext.name,
              "description": ext.description,
              "applicationCategory": ext.category,
              "url": ext.repoUrl
            }
          }))
        }
      })
    };
    pageSchemas.push(searchResultsSchema);
  }

  // Category Page Schema
  if (pageType === 'category' && category) {
    const categorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category} Extensions for Claude AI`,
      "description": `Discover ${category.toLowerCase()} extensions and tools for Claude AI`,
      "url": `${baseUrl}/category/${category.toLowerCase()}`,
      "about": {
        "@type": "Thing",
        "name": category,
        "description": `${category} tools and extensions for Claude AI`
      },
      ...(extensions && {
        "mainEntity": {
          "@type": "ItemList",
          "name": `${category} Extensions`,
          "numberOfItems": extensions.length,
          "itemListElement": extensions.map((ext, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "SoftwareApplication",
              "name": ext.name,
              "description": ext.description,
              "applicationCategory": ext.category,
              "url": ext.repoUrl
            }
          }))
        }
      })
    };
    pageSchemas.push(categorySchema);
  }

  // Individual Extension Schema
  if (pageType === 'extension' && extension) {
    const extensionSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": extension.name,
      "description": extension.description,
      "url": extension.repoUrl,
      "downloadUrl": extension.repoUrl,
      "applicationCategory": extension.category,
      "operatingSystem": "Any",
      "softwareVersion": "Latest",
      "releaseNotes": `${extension.name} extension for Claude AI`,
      "author": {
        "@type": extension.author?.includes('Claude Hub') ? "Organization" : "Person",
        "name": extension.author || "Community"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "keywords": [
        extension.category,
        "Claude AI",
        "Extension",
        ...(extension.tags || [])
      ].join(", "),
      ...(extension.stars && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": Math.min(5, Math.max(1, extension.stars / 1000)),
          "bestRating": 5,
          "worstRating": 1,
          "ratingCount": extension.stars,
          "reviewCount": Math.floor(extension.stars / 10)
        }
      }),
      ...(extension.lastUpdated && {
        "dateModified": extension.lastUpdated,
        "softwareHelp": {
          "@type": "CreativeWork",
          "url": `${extension.repoUrl}#readme`
        }
      }),
      "isPartOf": {
        "@type": "WebSite",
        "name": "Claude Hub",
        "url": baseUrl
      }
    };
    pageSchemas.push(extensionSchema);
  }

  // FAQ Schema for main pages
  if (pageType === 'website') {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Claude Hub?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Claude Hub is a comprehensive directory of extensions, tools, and integrations for Claude AI. Discover productivity apps, development tools, browser extensions, and more to enhance your Claude experience."
          }
        },
        {
          "@type": "Question",
          "name": "How do I find extensions for Claude AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can search for extensions using our search bar, browse by categories, or explore all available extensions. Use filters to find exactly what you need based on stars, downloads, or last updated date."
          }
        },
        {
          "@type": "Question",
          "name": "Are all extensions free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most extensions in our directory are free and open source. Each extension page includes information about pricing and licensing."
          }
        },
        {
          "@type": "Question",
          "name": "How often is the directory updated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our directory is updated regularly with new extensions and tools. Extension information including stars, downloads, and last updated dates are refreshed frequently."
          }
        }
      ]
    };
    pageSchemas.push(faqSchema);
  }

  const schemas = [
    websiteSchema,
    organizationSchema,
    breadcrumbSchema,
    ...(collectionSchema ? [collectionSchema] : []),
    ...pageSchemas
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  );
}