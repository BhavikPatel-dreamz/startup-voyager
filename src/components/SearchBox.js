import { useState } from 'react';

export default function SearchBox({ analytics, platform }) {
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Perform search (your search logic here)
    const results = await searchProducts(query, platform);
    
    // Track the search
    analytics.trackSearch(query, results.length, platform);
    
    setQuery('');
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button type="submit">Search</button>
    </form>
  );
}