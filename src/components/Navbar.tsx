import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Tv } from 'lucide-react';
import { Show } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Show[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setLiveResults((data.results || []).slice(0, 6));
        setShowDropdown(true);
      } catch {
        setLiveResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleResultClick = (show: Show) => {
    setSearchQuery('');
    setShowDropdown(false);
    navigate(`/show/${show.id}-${slugify(show.name)}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:shadow-lg transition-shadow duration-200">
              <Tv className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShowFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Browse
            </Link>
            <Link
              to="/watchlist"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Watchlist
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onFocus={() => { if (liveResults.length > 0) setShowDropdown(true); }}
                autoComplete="off"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {showDropdown && liveResults.length > 0 && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : (
                    liveResults.map((show) => (
                      <button
                        key={show.id}
                        type="button"
                        onClick={() => handleResultClick(show)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 flex items-center gap-3"
                      >
                        {show.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w92${show.poster_path}`} alt={show.name} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1">{show.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{show.first_air_date?.slice(0, 4)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1"
              >
                Home
              </Link>
              <Link 
                to="/search" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1"
              >
                Browse
              </Link>
              <Link 
                to="/watchlist" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1"
              >
                Watchlist
              </Link>
              <form onSubmit={handleSearch} className="px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;