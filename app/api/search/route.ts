import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'movie';

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'TMDB API key not configured' },
        { status: 500 }
      );
    }

    // Determine the endpoint based on type
    const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';

    // Make request to TMDB API
    const tmdbResponse = await fetch(
      `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!tmdbResponse.ok) {
      throw new Error('Failed to fetch from TMDB');
    }

    const data = await tmdbResponse.json();

    // Format the results
    const results = data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      overview: item.overview,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      media_type: type
    }));

    return NextResponse.json({
      success: true,
      data: results,
      total_results: data.total_results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    );
  }
}