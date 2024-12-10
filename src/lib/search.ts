interface SearchResult {
  id: string;
  title: string;
  description: string;
}

// Mock search function - replace with actual implementation
export async function searchData(query: string): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock results
  return [
    {
      id: '1',
      title: `Result for "${query}" 1`,
      description: 'Sample description for the first result'
    },
    {
      id: '2',
      title: `Result for "${query}" 2`,
      description: 'Sample description for the second result'
    }
  ];
}