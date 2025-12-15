"use client";
import React, { useState } from 'react';
import { Search, Film, Tv, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
}

export default function SearchPage() {
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { isAuthenticated, initialized } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/');
    }
  }, [initialized, isAuthenticated, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);

      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );

      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to search');
      }

      setResults(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTitle = (item: SearchResult) => {
    return item.title || item.name || 'Unknown';
  };

  const getDisplayDate = (item: SearchResult) => {
    const date = item.release_date || item.first_air_date;
    if (!date) return 'N/A';
    return new Date(date).getFullYear();
  };

  const handleResultClick = (item: SearchResult) => {
    if (searchType === 'movie') {
      router.push(`/movie/${item.id}`);
    } else {
      router.push(`/show/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Search className="w-10 h-10" />
            Search Movies & TV Shows
          </h1>
          <p className="text-purple-200">Discover your next watch</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            {/* Type Selector */}
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'movie' | 'tv')}
              className="px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition min-w-[140px]"
            >
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for ${searchType === 'movie' ? 'movies' : 'TV shows'}...`}
                className="w-full px-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition pr-12"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              Searching...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-200 text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-12">
            {searchType === 'movie' ? (
              <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            ) : (
              <Tv className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            )}
            <p className="text-slate-400 text-lg">No results found</p>
            <p className="text-slate-500 text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-purple-300 text-sm mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleResultClick(item)}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/60 transition-all hover:transform hover:scale-105 shadow-xl text-left"
                >
                  {/* Poster */}
                  <div className="w-full aspect-[2/3] bg-slate-700">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full flex items-center justify-center';
                            const icon = searchType === 'movie' ? 
                              '<svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>' :
                              '<svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>';
                            placeholder.innerHTML = icon;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {searchType === 'movie' ? (
                          <Film className="w-12 h-12 text-slate-500" />
                        ) : (
                          <Tv className="w-12 h-12 text-slate-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {getDisplayTitle(item)}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{getDisplayDate(item)}</span>
                    </div>

                    {item.vote_average > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-yellow-500 font-semibold">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}