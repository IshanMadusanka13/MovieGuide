"use client";
import React, { useState, useEffect } from 'react';
import { Film, Calendar, Clock, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  genres: string[];
  release_date: string;
  poster_path: string;
  runtime: number;
  status: string;
  tagline: string;
  vote_average?: number;
}

interface PageProps {
  params: any; // allow promise or object; will be unwrapped at runtime
}

export default function MovieDetailsPage({ params }: PageProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const { username, isAuthenticated, initialized } = useAuth();
  const router = useRouter();

  const isThenable = (p: any): p is Promise<any> => p && typeof p.then === 'function';

  const resolvedParams = isThenable(params) ? (React as any).use(params) : params;

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/');
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
        console.log('Fetching movie details for ID:', resolvedParams?.id);
      fetchMovieDetails();
    }
  }, [initialized, isAuthenticated, resolvedParams?.id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/detail/${resolvedParams?.id}/movie?username=${username}`);

      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch movie details');
      }

      setMovie(result.data);
      setIsWatched(result.isWatched || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/detail/${resolvedParams?.id}/movie?username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as watched');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to mark as watched');
      }

      setIsWatched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading movie details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-200 text-center">{error}</p>
          <button 
            onClick={fetchMovieDetails}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
          <div className="grid md:grid-cols-[300px_1fr] gap-8 p-8">
            {/* Poster */}
            <div className="w-full">
              <div className="w-full aspect-[2/3] bg-slate-700 rounded-xl overflow-hidden shadow-xl">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center';
                        placeholder.innerHTML = '<svg class="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-20 h-20 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Watch Status Button/Label */}
              <div className="mt-6">
                {isWatched ? (
                  <div className="w-full bg-green-500/20 border-2 border-green-500 rounded-xl p-4 flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-bold text-lg">Watched</span>
                  </div>
                ) : (
                  <button
                    onClick={handleMarkAsWatched}
                    disabled={actionLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Marking as Watched...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Mark as Watched
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="text-purple-300 italic text-lg mb-6">
                    "{movie.tagline}"
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>

                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span>
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    </div>
                  )}

                  {movie.vote_average && movie.vote_average > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <svg className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-yellow-500 font-semibold">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Genres</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                {/* Status */}
                {movie.status && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Status:</span>
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600">
                      {movie.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}