// app/api/movies/[id]/watch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {dbConnect} from '@/utils/dbConnect';
import Movie from '@/models/Movie';
import User from '@/models/User';
import WatchedMovie from '@/models/WatchedMovie';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// GET handler: fetch movie details (DB -> TMDB) and check watched status for username query param
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const movieId = parseInt(id);
    if (!movieId) {
      return NextResponse.json({ success: false, error: 'Invalid movie ID' }, { status: 400 });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get('username') || undefined;

    // Try to find movie in DB
    let movie = await Movie.findOne({ id: movieId });

    if (!movie) {
      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { success: false, error: 'TMDB API key not configured' },
          { status: 500 }
        );
      }

      const tmdbResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!tmdbResponse.ok) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch movie from TMDB' },
          { status: 502 }
        );
      }

      const tmdbData = await tmdbResponse.json();

      // construct plain object from TMDB response (do NOT persist)
      movie = {
        id: tmdbData.id,
        title: tmdbData.title,
        overview: tmdbData.overview,
        genres: Array.isArray(tmdbData.genres) ? tmdbData.genres.map((g: any) => g.name) : [],
        release_date: tmdbData.release_date,
        poster_path: tmdbData.poster_path,
        runtime: tmdbData.runtime,
        status: tmdbData.status,
        tagline: tmdbData.tagline || ''
      } as any;
    }

    // Determine watched status (default false)
    let isWatched = false;
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        const existingWatch = await WatchedMovie.findOne({
          user_id: user.user_id,
          id: movieId
        });
        isWatched = !!existingWatch;
      } else {
        isWatched = false;
      }
    }

    return NextResponse.json({
      success: true,
      data: movie,
      isWatched
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { username } = await request.json();
    const { id } = await params;
    console.log('Marking movie as watched:', id, 'for user:', username);
    const movieId = parseInt(id);

    if (!movieId) {
      return NextResponse.json(
        { success: false, error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if movie exists in our database
    let movie = await Movie.findOne({ id: movieId });

    if (!movie) {
      // Movie doesn't exist, fetch from TMDB and save
      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { success: false, error: 'TMDB API key not configured' },
          { status: 500 }
        );
      }

      const tmdbResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!tmdbResponse.ok) {
        throw new Error('Failed to fetch movie from TMDB');
      }

      const tmdbData = await tmdbResponse.json();

      // Save movie to our database
      movie = await Movie.create({
        id: tmdbData.id,
        title: tmdbData.title,
        overview: tmdbData.overview,
        genres: tmdbData.genres.map((g: any) => g.name),
        release_date: tmdbData.release_date,
        poster_path: tmdbData.poster_path,
        runtime: tmdbData.runtime,
        status: tmdbData.status,
        tagline: tmdbData.tagline || ''
      });
    }

    // Check if already watched
    const existingWatch = await WatchedMovie.findOne({
      user_id: user.user_id,
      id: movieId
    });

    if (existingWatch) {
      return NextResponse.json(
        { success: false, error: 'Movie already marked as watched' },
        { status: 400 }
      );
    }

    // Create watched movie entry
    const watchedMovie = await WatchedMovie.create({
      user_id: user.user_id,
      id: movieId,
      watched_at: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Movie marked as watched',
      data: watchedMovie
    });

  } catch (error) {
    console.error('Error marking movie as watched:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark movie as watched' },
      { status: 500 }
    );
  }
}