// Web Worker for heavy search computations
// This offloads expensive search operations from the main thread

// Fuzzy search algorithm with scoring
function fuzzySearch(query, items) {
  const normalizedQuery = query.toLowerCase();
  const queryChars = normalizedQuery.split('');
  
  return items
    .map(item => {
      const normalizedTitle = item.name.toLowerCase();
      const normalizedDescription = item.description.toLowerCase();
      const normalizedAuthor = (item.author || '').toLowerCase();
      const normalizedCategory = item.category.toLowerCase();
      
      let score = 0;
      let titleMatches = 0;
      let descMatches = 0;
      let authorMatches = 0;
      let categoryMatches = 0;
      
      // Exact match bonus
      if (normalizedTitle.includes(normalizedQuery)) score += 100;
      if (normalizedDescription.includes(normalizedQuery)) score += 50;
      if (normalizedAuthor.includes(normalizedQuery)) score += 25;
      if (normalizedCategory.includes(normalizedQuery)) score += 75;
      
      // Character-based fuzzy matching
      queryChars.forEach(char => {
        if (normalizedTitle.includes(char)) titleMatches++;
        if (normalizedDescription.includes(char)) descMatches++;
        if (normalizedAuthor.includes(char)) authorMatches++;
        if (normalizedCategory.includes(char)) categoryMatches++;
      });
      
      // Calculate fuzzy score
      score += (titleMatches / queryChars.length) * 50;
      score += (descMatches / queryChars.length) * 25;
      score += (authorMatches / queryChars.length) * 15;
      score += (categoryMatches / queryChars.length) * 35;
      
      // Popularity bonus
      if (item.stars) score += Math.log10(item.stars + 1) * 5;
      if (item.downloads) score += Math.log10(item.downloads + 1) * 3;
      
      // Recent activity bonus
      if (item.lastUpdated) {
        const daysSinceUpdate = (Date.now() - new Date(item.lastUpdated)) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30) score += 10;
        else if (daysSinceUpdate < 90) score += 5;
      }
      
      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item);
}

// Generate search suggestions
function generateSuggestions(query, items) {
  if (\!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase();
  const suggestions = new Set();
  
  // Extract words from titles and descriptions
  items.forEach(item => {
    const words = [
      ...item.name.toLowerCase().split(/\W+/),
      ...item.description.toLowerCase().split(/\W+/),
      ...item.category.toLowerCase().split(/\W+/),
      ...(item.author || '').toLowerCase().split(/\W+/)
    ];
    
    words.forEach(word => {
      if (word.length >= 3 && word.startsWith(normalizedQuery.slice(0, 2))) {
        suggestions.add(word);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 8);
}

// Filter and sort items
function filterAndSort(items, options = {}) {
  let filtered = [...items];
  
  // Apply category filter
  if (options.category && options.category \!== 'All') {
    filtered = filtered.filter(item => item.category === options.category);
  }
  
  // Sort items
  if (options.sortBy) {
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (options.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stars':
          aValue = a.stars || 0;
          bValue = b.stars || 0;
          break;
        case 'downloads':
          aValue = a.downloads || 0;
          bValue = b.downloads || 0;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated || 0);
          bValue = new Date(b.lastUpdated || 0);
          break;
        default:
          return 0;
      }
      
      if (options.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
  
  return filtered;
}

// Web Worker message handler
self.addEventListener('message', function(e) {
  const { type, payload } = e.data;
  
  try {
    switch (type) {
      case 'SEARCH':
        const { query, items } = payload;
        const results = fuzzySearch(query, items);
        self.postMessage({ type: 'SEARCH_RESULTS', payload: results });
        break;
        
      case 'SUGGESTIONS':
        const suggestions = generateSuggestions(payload.query, payload.items);
        self.postMessage({ type: 'SUGGESTIONS_RESULTS', payload: suggestions });
        break;
        
      case 'FILTER_SORT':
        const filtered = filterAndSort(payload.items, payload.options);
        self.postMessage({ type: 'FILTER_SORT_RESULTS', payload: filtered });
        break;
        
      default:
        self.postMessage({ type: 'ERROR', payload: 'Unknown message type' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error.message });
  }
});

// Notify that worker is ready
self.postMessage({ type: 'WORKER_READY' });
EOF < /dev/null