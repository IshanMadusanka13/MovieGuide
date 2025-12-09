"use client";
import React, { useState, useEffect } from 'react';
import { Tv, Calendar, Tag, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Episode {
    episode_number: number;
    name: string;
    overview: string;
    runtime: number;
    watched?: boolean;
}

interface Season {
    season_number: number;
    name: string;
    overview: string;
    episode_count: number;
    air_date: string;
    episodes: Episode[];
}

interface ShowDetails {
    id: number;
    name: string;
    overview: string;
    genres: string[];
    number_of_episodes: number;
    number_of_seasons: number;
    poster_path: string;
    seasons: Season[];
    status: string;
    tagline: string;
}

interface PageProps {
    params: any;
}

export default function ShowDetailsPage({ params }: PageProps) {
    const [show, setShow] = useState<ShowDetails | null>(null);
    const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState('');
    const { username, isAuthenticated } = useAuth();
    const router = useRouter();

    const isThenable = (p: any): p is Promise<any> => p && typeof p.then === 'function';
    const resolvedParams = isThenable(params) ? (React as any).use(params) : params;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            console.log('Fetching show details for ID:', resolvedParams?.id);
            fetchShowDetails();
        }
    }, [isAuthenticated, resolvedParams?.id]);

    const fetchShowDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/detail/${resolvedParams?.id}/show?username=${username}`);

            if (!response.ok) {
                throw new Error('Failed to fetch show details');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch show details');
            }

            setShow(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeason = (seasonNumber: number) => {
        setExpandedSeasons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(seasonNumber)) {
                newSet.delete(seasonNumber);
            } else {
                newSet.add(seasonNumber);
            }
            return newSet;
        });
    };

    const handleMarkEpisodeAsWatched = async (seasonNumber: number, episodeNumber: number) => {
        const key = `episode-${seasonNumber}-${episodeNumber}`;
        try {
            setActionLoading(prev => ({ ...prev, [key]: true }));
            const response = await fetch(`/api/detail/${resolvedParams?.id}/show`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    season_number: seasonNumber,
                    episode_number: episodeNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark episode as watched');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to mark episode as watched');
            }

            // Update local state
            setShow(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    seasons: prev.seasons.map(season => {
                        if (season.season_number === seasonNumber) {
                            return {
                                ...season,
                                episodes: season.episodes.map(ep => {
                                    if (ep.episode_number === episodeNumber) {
                                        return { ...ep, watched: true };
                                    }
                                    return ep;
                                })
                            };
                        }
                        return season;
                    })
                };
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleMarkSeasonAsWatched = async (seasonNumber: number) => {
        const key = `season-${seasonNumber}`;
        try {
            setActionLoading(prev => ({ ...prev, [key]: true }));
            const response = await fetch(`/api/detail/${resolvedParams?.id}/show/season`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    season_number: seasonNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark season as watched');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to mark season as watched');
            }

            // Update local state - mark all episodes in season as watched
            setShow(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    seasons: prev.seasons.map(season => {
                        if (season.season_number === seasonNumber) {
                            return {
                                ...season,
                                episodes: season.episodes.map(ep => ({ ...ep, watched: true }))
                            };
                        }
                        return season;
                    })
                };
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const isSeasonFullyWatched = (season: Season) => {
        return season.episodes.length > 0 && season.episodes.every(ep => ep.watched);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    Loading show details...
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
                        onClick={fetchShowDetails}
                        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!show) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Show not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl mb-6">
                    <div className="grid md:grid-cols-[300px_1fr] gap-8 p-8">
                        {/* Poster */}
                        <div className="w-full">
                            <div className="w-full aspect-[2/3] bg-slate-700 rounded-xl overflow-hidden shadow-xl">
                                {show.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                        alt={show.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const placeholder = document.createElement('div');
                                                placeholder.className = 'w-full h-full flex items-center justify-center';
                                                placeholder.innerHTML = '<svg class="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>';
                                                parent.appendChild(placeholder);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Tv className="w-20 h-20 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-3">
                                    {show.name}
                                </h1>

                                {show.tagline && (
                                    <p className="text-purple-300 italic text-lg mb-6">
                                        "{show.tagline}"
                                    </p>
                                )}

                                {/* Meta Information */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                        <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Tv className="w-5 h-5 text-purple-400" />
                                        <span>{show.number_of_episodes} Episode{show.number_of_episodes !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                {/* Genres */}
                                {show.genres && show.genres.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="w-5 h-5 text-purple-400" />
                                            <h3 className="text-lg font-semibold text-white">Genres</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {show.genres.map((genre, index) => (
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
                                        {show.overview || 'No overview available.'}
                                    </p>
                                </div>

                                {/* Status */}
                                {show.status && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-sm">Status:</span>
                                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600">
                                            {show.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seasons Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Seasons & Episodes</h2>

                    {show.seasons.map((season) => {
                        const isExpanded = expandedSeasons.has(season.season_number);
                        const isFullyWatched = isSeasonFullyWatched(season);
                        const seasonKey = `season-${season.season_number}`;

                        return (
                            <div
                                key={season.season_number}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-lg overflow-hidden"
                            >
                                {/* Season Header */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => toggleSeason(season.season_number)}
                                            className="flex items-center gap-3 flex-1 text-left group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30 group-hover:bg-purple-600/30 transition">
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-purple-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-purple-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                                                        {season.name}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm">
                                                        {season.episode_count} Episode{season.episode_count !== 1 ? 's' : ''}
                                                        {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Season Watch Button */}
                                        <div className="ml-4">
                                            {isFullyWatched ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    <span className="text-green-300 font-semibold">Watched</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkSeasonAsWatched(season.season_number)}
                                                    disabled={actionLoading[seasonKey]}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[seasonKey] ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Marking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            Mark Season
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {season.overview && (
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {season.overview}
                                        </p>
                                    )}
                                </div>

                                {/* Episodes List */}
                                {isExpanded && (
                                    <div className="border-t border-purple-500/20 bg-slate-900/30">
                                        <div className="p-6 space-y-3">
                                            {season.episodes.map((episode) => {
                                                const episodeKey = `episode-${season.season_number}-${episode.episode_number}`;
                                                return (
                                                    <div
                                                        key={episode.episode_number}
                                                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/30 transition"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-medium">
                                                                Episode {episode.episode_number}: {episode.name}
                                                            </h4>
                                                            {episode.runtime > 0 && (
                                                                <p className="text-slate-400 text-sm mt-1">
                                                                    {episode.runtime} minutes
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Episode Watch Button */}
                                                        <div className="ml-4">
                                                            {episode.watched ? (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500 rounded-lg">
                                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                                    <span className="text-green-300 text-sm font-semibold">Watched</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleMarkEpisodeAsWatched(season.season_number, episode.episode_number)}
                                                                    disabled={actionLoading[episodeKey]}
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {actionLoading[episodeKey] ? (
                                                                        <>
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                            Marking...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Mark
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}