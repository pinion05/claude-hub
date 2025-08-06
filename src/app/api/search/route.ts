import { NextRequest, NextResponse } from 'next/server';
import { 
  searchExtensions, 
  getFilteredSuggestions,
  getSearchSuggestions 
} from '@/lib/server/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'extensions' or 'suggestions'
    
    // Get search suggestions
    if (type === 'suggestions') {
      if (query) {
        const suggestions = await getFilteredSuggestions(query);
        return NextResponse.json({ suggestions });
      } else {
        const suggestions = await getSearchSuggestions();
        return NextResponse.json({ suggestions });
      }
    }
    
    // Default: search extensions
    if (!query) {
      return NextResponse.json({ 
        extensions: [],
        query: '',
        total: 0 
      });
    }
    
    const extensions = await searchExtensions(query);
    
    return NextResponse.json({
      extensions,
      query,
      total: extensions.length
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;
    
    // Advanced search with filters
    let extensions = await searchExtensions(query || '');
    
    // Apply additional filters if provided
    if (filters) {
      if (filters.category) {
        extensions = extensions.filter(ext => ext.category === filters.category);
      }
      
      if (filters.minStars) {
        extensions = extensions.filter(ext => (ext.stars || 0) >= filters.minStars);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        extensions = extensions.filter(ext => 
          ext.tags?.some(tag => 
            filters.tags.some((filterTag: string) => 
              tag.toLowerCase().includes(filterTag.toLowerCase())
            )
          )
        );
      }
    }
    
    return NextResponse.json({
      extensions,
      query,
      total: extensions.length,
      filters
    });
    
  } catch (error) {
    console.error('Advanced search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform advanced search' }, 
      { status: 500 }
    );
  }
}