import { useState, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { useDebounce } from '@/hooks/useDebounce';
import { searchData } from '@/lib/search';

export function SearchContainer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchData(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <SearchInput
        onSearch={setQuery}
        placeholder="Search data... (⌘ + /)"
        className="w-full"
      />
      <SearchResults results={results} isLoading={isLoading} />
    </div>
  );
}