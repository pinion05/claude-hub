import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.github_url || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newEntry = {
      name: body.name,
      github_url: body.github_url,
      category: body.category,
      tags: body.tags || [],
      added_at: new Date().toISOString()
    };

    // Get current data from Redis
    const rawData = await redis.get('extensions:data');
    let repositories = [];
    
    if (rawData) {
      try {
        repositories = JSON.parse(rawData);
        if (!Array.isArray(repositories)) {
          repositories = [];
        }
      } catch (e) {
        console.error('Error parsing Redis data:', e);
        repositories = [];
      }
    }

    // Append new entry
    repositories.push(newEntry);

    // Save back to Redis
    await redis.set('extensions:data', JSON.stringify(repositories));

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Failed to add extension:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
