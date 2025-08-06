import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllExtensions, 
  getExtensionsByCategory, 
  filterExtensions, 
  getExtensionById,
  getFeaturedExtensions,
  getExtensionStats 
} from '@/lib/server/data';
import { ExtensionCategory, FilterOptions } from '@/types';

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url);
    
    // Get specific extension by ID
    const id = searchParams.get('id');
    if (id) {
      const extension = await getExtensionById(parseInt(id));
      if (!extension) {
        return NextResponse.json({ error: 'Extension not found' }, { status: 404 });
      }
      return NextResponse.json(extension);
    }
    
    // Get featured extensions
    const featured = searchParams.get('featured');
    if (featured) {
      const limit = parseInt(searchParams.get('limit') || '10');
      const extensions = await getFeaturedExtensions(limit);
      return NextResponse.json(extensions);
    }
    
    // Get statistics
    const stats = searchParams.get('stats');
    if (stats) {
      const statistics = await getExtensionStats();
      return NextResponse.json(statistics);
    }
    
    // Filter by category
    const category = searchParams.get('category') as ExtensionCategory;
    if (category) {
      const extensions = await getExtensionsByCategory(category);
      return NextResponse.json(extensions);
    }
    
    // Apply filters and sorting
    const sortBy = searchParams.get('sortBy') as FilterOptions['sortBy'];
    const sortOrder = searchParams.get('sortOrder') as FilterOptions['sortOrder'];
    const filterCategory = searchParams.get('filter') as ExtensionCategory;
    
    if (sortBy || filterCategory) {
      const filterOptions: FilterOptions = {
        ...(sortBy && { sortBy }),
        sortOrder: sortOrder || 'desc',
        ...(filterCategory && { category: filterCategory })
      };
      const extensions = await filterExtensions(filterOptions);
      return NextResponse.json(extensions);
    }
    
    // Default: get all extensions
    const extensions = await getAllExtensions();
    return NextResponse.json(extensions);
    
  } catch (error) {
    console.error('Extensions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extensions' }, 
      { status: 500 }
    );
  }
}

// For potential future POST/PUT/DELETE operations
export async function POST(_request: NextRequest) {
  // This would handle creating new extensions
  return NextResponse.json(
    { error: 'Method not implemented' }, 
    { status: 501 }
  );
}