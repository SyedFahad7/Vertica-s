import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Show } from '../types';
import ShowCard from '../components/ShowCard';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep URL in sync with searchQuery
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setShows([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      const fetchSearch = async () => {
        setLoading(true);
        setError(null);
        try {
          const apiKey = import.meta.env.VITE_TMDB_API_KEY;
          const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`);
          if (!res.ok) {
            if (res.status === 429) {
              throw new Error('API quota exceeded. Please try again later.');
            }
            throw new Error('Failed to fetch search results from TMDB.');
          }
          const data = await res.json();
          const shows: Show[] = (data.results || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            overview: item.overview,
            first_air_date: item.first_air_date,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            vote_count: item.vote_count,
            popularity: item.popularity,
            genre_ids: item.genre_ids || [],
            origin_country: item.origin_country || [],
            original_language: item.original_language,
            original_name: item.original_name,
            seasons: [],
            status: '',
            number_of_episodes: 0,
            number_of_seasons: 0,
            networks: [],
            created_by: [],
          }));
          setShows(shows);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch search results from TMDB.');
        } finally {
          setLoading(false);
        }
      };
      fetchSearch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const filteredAndSortedShows = useMemo(() => {
    let filtered = shows;
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime();
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
    return filtered;
  }, [shows, sortBy]);

  // Keyboard accessibility: Escape clears input, Enter submits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse TV Shows'}
          </h1>
          <form onSubmit={e => e.preventDefault()} className="mb-6">
            <div className="relative max-w-2xl">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for TV shows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                aria-label="Search for TV shows"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort</span>
                {showFilters && <X className="h-4 w-4" />}
              </button>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort shows"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="name">Sort by Name</option>
                <option value="year">Sort by Year</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            <div className="text-gray-600">
              {loading ? 'Loading...' : `${filteredAndSortedShows.length} shows found`}
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 text-center mb-4">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <SearchIcon className="animate-spin h-12 w-12 text-blue-500" />
          </div>
        ) : filteredAndSortedShows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <SearchIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shows found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
            {filteredAndSortedShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;