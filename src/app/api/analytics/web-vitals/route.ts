import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  deviceInfo?: {
    deviceMemory: number | null;
    hardwareConcurrency: number | null;
    screen: {
      width: number;
      height: number;
      pixelDepth: number;
    };
  };
}

/**
 * Web Vitals analytics endpoint
 * Receives Core Web Vitals metrics from the client
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validate the metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 });
    }

    // Rate limiting check (simple implementation)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const isRateLimited = await checkRateLimit(clientIP);
    
    if (isRateLimited) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    // Log the metric (in production, you might send to a analytics service)
    console.error('Web Vital received:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString(),
      userAgent: metric.userAgent,
      connection: metric.connection,
      deviceInfo: metric.deviceInfo
    });

    // In a real application, you would:
    // 1. Store in a database or send to analytics service
    // 2. Aggregate metrics for performance dashboards
    // 3. Set up alerts for poor performance
    
    // Example: Send to external analytics service
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      try {
        await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
          },
          body: JSON.stringify({
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            page: metric.url,
            timestamp: metric.timestamp,
            user_agent: metric.userAgent,
            connection_type: metric.connection?.effectiveType,
            device_memory: metric.deviceInfo?.deviceMemory,
            screen_size: `${metric.deviceInfo?.screen.width}x${metric.deviceInfo?.screen.height}`,
          }),
        });
      } catch (error) {
        console.error('Failed to send to external analytics:', error);
      }
    }

    // Store in database (example with hypothetical storage)
    try {
      await storeMetric(metric);
    } catch (error) {
      console.error('Failed to store metric:', error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Simple rate limiting implementation
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(clientIP: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // Max requests per window

  const current = rateLimitStore.get(clientIP);
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  if (current.count >= maxRequests) {
    return true; // Rate limited
  }

  current.count++;
  return false;
}

/**
 * Store metric in database
 * This is a placeholder - implement according to your storage solution
 */
async function storeMetric(metric: WebVitalMetric): Promise<void> {
  // Example implementation with a hypothetical database
  // In practice, you might use:
  // - Supabase for PostgreSQL
  // - MongoDB
  // - InfluxDB for time-series data
  // - Google Analytics 4 Measurement Protocol
  // - Custom analytics platform
  
  const metricData = {
    id: `${metric.name}-${metric.id}`,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    url: metric.url,
    timestamp: new Date(metric.timestamp),
    user_agent: metric.userAgent,
    connection_effective_type: metric.connection?.effectiveType,
    connection_downlink: metric.connection?.downlink,
    connection_rtt: metric.connection?.rtt,
    connection_save_data: metric.connection?.saveData,
    device_memory: metric.deviceInfo?.deviceMemory,
    device_hardware_concurrency: metric.deviceInfo?.hardwareConcurrency,
    screen_width: metric.deviceInfo?.screen.width,
    screen_height: metric.deviceInfo?.screen.height,
    screen_pixel_depth: metric.deviceInfo?.screen.pixelDepth,
    created_at: new Date(),
  };

  // Store in database
  // await database.collection('web_vitals').insertOne(metricData);
  
  // For development, just log
  if (process.env.NODE_ENV === 'development') {
    console.error('Would store metric:', metricData);
  }
}

/**
 * GET endpoint for retrieving aggregated metrics
 * Useful for performance dashboards
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '24h';
    const metric = url.searchParams.get('metric');

    // In a real app, query your database for aggregated metrics
    const mockData = {
      timeframe,
      metrics: {
        CLS: {
          p50: 0.05,
          p75: 0.08,
          p90: 0.12,
          average: 0.07,
          samples: 1250
        },
        FID: {
          p50: 45,
          p75: 78,
          p90: 120,
          average: 65,
          samples: 980
        },
        FCP: {
          p50: 1200,
          p75: 1800,
          p90: 2400,
          average: 1450,
          samples: 1500
        },
        LCP: {
          p50: 1800,
          p75: 2200,
          p90: 2800,
          average: 2100,
          samples: 1500
        },
        TTFB: {
          p50: 450,
          p75: 680,
          p90: 950,
          average: 580,
          samples: 1500
        }
      },
      performanceScore: 85
    };

    if (metric && mockData.metrics[metric as keyof typeof mockData.metrics]) {
      return NextResponse.json({
        metric,
        data: mockData.metrics[metric as keyof typeof mockData.metrics]
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}