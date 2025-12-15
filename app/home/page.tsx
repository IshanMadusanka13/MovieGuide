"use client";
import React, { useState, useEffect } from 'react';
import { Film, Tv, Clock, TrendingUp, Calendar, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';

interface UserStats {
  moviesWatched: number;
  showsWatched: number;
  episodesWatched: number;
  totalMovieTime: number; // in minutes
  totalShowTime: number; // in minutes
  recentMovies: RecentMovie[];
  recentEpisodes: RecentEpisode[];
}

interface RecentMovie {
  id: number;
  title: string;
  poster_path: string;
  watched_at: string;
  runtime: number;
}

interface RecentEpisode {
  show_id: number;
  show_name: string;
  show_poster_path: string;
  season_number: number;
  episode_number: number;
  episode_name: string;
  watched_at: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { username, isAuthenticated, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/');
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (initialized && isAuthenticated && username) {
      fetchUserStats();
    }
  }, [initialized, isAuthenticated, username]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats?username=${username}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user stats');
      }

      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading your stats...
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
            onClick={fetchUserStats}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No stats available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-purple-300 text-lg">
            Here's your watching journey so far
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Movies Watched */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Film className="w-8 h-8 text-purple-400" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Movies Watched</h3>
            <p className="text-4xl font-bold text-white">{stats.moviesWatched}</p>
          </div>

          {/* Shows Watched */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Tv className="w-8 h-8 text-blue-400" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Shows Watched</h3>
            <p className="text-4xl font-bold text-white">{stats.showsWatched}</p>
          </div>

          {/* Episodes Watched */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-cyan-600/20 p-3 rounded-lg">
                <Play className="w-8 h-8 text-cyan-400" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Episodes Watched</h3>
            <p className="text-4xl font-bold text-white">{stats.episodesWatched}</p>
          </div>

          {/* Total Movie Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <Film className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Time on Movies</h3>
            <p className="text-4xl font-bold text-white">{formatTotalTime(stats.totalMovieTime)}</p>
          </div>

          {/* Total Show Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-600/20 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-pink-400" />
              </div>
              <Tv className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Time on Shows</h3>
            <p className="text-4xl font-bold text-white">{formatTotalTime(stats.totalShowTime)}</p>
          </div>

          {/* Total Time */}
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl border border-purple-500/40 p-6 hover:border-purple-500/60 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-purple-200 text-sm font-medium mb-1">Total Watch Time</h3>
            <p className="text-4xl font-bold text-white">
              {formatTotalTime(stats.totalMovieTime + stats.totalShowTime)}
            </p>
          </div>
        </div>

        {/* Recently Watched Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Watched Movies */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Film className="w-6 h-6 text-purple-400" />
              Recently Watched Movies
            </h2>
            <div className="space-y-4">
              {stats.recentMovies.length > 0 ? (
                stats.recentMovies.map((movie) => (
                  <Link
                    key={`${movie.id}-${movie.watched_at}`}
                    href={`/detail/${movie.id}/movie`}
                    className="block bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden group"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-28 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-purple-300 transition truncate">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(movie.runtime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(movie.watched_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No movies watched yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Watched Episodes */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Tv className="w-6 h-6 text-blue-400" />
              Recently Watched Episodes
            </h2>
            <div className="space-y-4">
              {stats.recentEpisodes.length > 0 ? (
                stats.recentEpisodes.map((episode, index) => (
                  <Link
                    key={`${episode.show_id}-${episode.season_number}-${episode.episode_number}-${index}`}
                    href={`/detail/${episode.show_id}/show`}
                    className="block bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden group"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-28 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        {episode.show_poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${episode.show_poster_path}`}
                            alt={episode.show_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="w-8 h-8 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-300 transition truncate">
                          {episode.show_name}
                        </h3>
                        <p className="text-purple-300 text-sm mb-2 truncate">
                          S{episode.season_number.toString().padStart(2, '0')}E{episode.episode_number.toString().padStart(2, '0')}: {episode.episode_name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(episode.watched_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
                  <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No episodes watched yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}