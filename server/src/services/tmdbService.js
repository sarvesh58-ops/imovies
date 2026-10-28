import axios from 'axios';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Checks if TMDB API is configured
 */
export const isTmdbConfigured = () => {
  return Boolean(ENV.TMDB_API_KEY && ENV.TMDB_API_KEY.trim() !== '');
};

/**
 * Transforms TMDB movie payload to our IMovies Schema structure
 */
export const formatTmdbMovie = (tmdbMovie) => {
  const genres = tmdbMovie.genres?.map((g) => g.name) || 
    (tmdbMovie.genre_ids ? ['Action', 'Drama'] : ['Cinema']);

  // Extract director from crew if credits included
  let director = '';
  let cast = [];
  if (tmdbMovie.credits) {
    const directorObj = tmdbMovie.credits.crew?.find((c) => c.job === 'Director');
    if (directorObj) director = directorObj.name;

    cast = (tmdbMovie.credits.cast || []).slice(0, 8).map((actor) => ({
      name: actor.name,
      role: actor.character || '',
      photo: actor.profile_path ? `${TMDB_IMAGE_BASE}/w300${actor.profile_path}` : ''
    }));
  }

  // Extract YouTube trailer key
  let trailerUrl = '';
  if (tmdbMovie.videos?.results) {
    const trailer = tmdbMovie.videos.results.find(
      (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    if (trailer) {
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    }
  }

  // Extract certification
  let certificate = 'UA';
  if (tmdbMovie.release_dates?.results) {
    const usRelease = tmdbMovie.release_dates.results.find((r) => r.iso_3166_1 === 'US' || r.iso_3166_1 === 'IN');
    if (usRelease && usRelease.release_dates?.length > 0) {
      const cert = usRelease.release_dates[0].certification;
      if (['U', 'UA', 'A', 'PG-13', 'R', 'NC-17'].includes(cert)) {
        certificate = cert;
      }
    }
  }

  // Fallback poster & backdrop
  const posterUrl = tmdbMovie.poster_path
    ? `${TMDB_IMAGE_BASE}/w780${tmdbMovie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  const bannerUrl = tmdbMovie.backdrop_path
    ? `${TMDB_IMAGE_BASE}/original${tmdbMovie.backdrop_path}`
    : posterUrl;

  const durationMinutes = Number(tmdbMovie.runtime) || 125;
  const ratingAverage = Math.round((tmdbMovie.vote_average || 7.5) * 10) / 10;
  const ratingCount = tmdbMovie.vote_count || 100;

  const languageMap = {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
    ko: 'Korean',
    de: 'German'
  };
  const langName = languageMap[tmdbMovie.original_language] || 'English';

  return {
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title || tmdbMovie.original_title || 'Untitled Movie',
    description: tmdbMovie.overview || 'No synopsis provided.',
    durationMinutes,
    releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : new Date(),
    genres: genres.length > 0 ? genres : ['Cinema'],
    languages: [langName],
    certificate,
    posterUrl,
    bannerUrl,
    trailerUrl,
    cast,
    director,
    ratingAverage,
    ratingCount,
    status: (new Date(tmdbMovie.release_date) > new Date()) ? 'coming_soon' : 'now_showing'
  };
};

/**
 * Fallback curated TMDB sample dataset when API key is not yet set
 */
const FALLBACK_TMDB_MOVIES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520bEx.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5200,
    original_language: 'en',
    genres: [{ name: 'Sci-Fi' }, { name: 'Adventure' }]
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 8900,
    original_language: 'en',
    genres: [{ name: 'Drama' }, { name: 'History' }]
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life until a threat to his home world forces him to suit up again alongside an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yD3rG5sM8n4b2a8j0s5g2f0d9a1.jpg',
    release_date: '2024-07-24',
    vote_average: 7.8,
    vote_count: 3600,
    original_language: 'en',
    genres: [{ name: 'Action' }, { name: 'Comedy' }]
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview: 'Teenager Riley’s mind headquarters undergo a sudden demolition to make room for unexpected new Emotions: Anxiety, Envy, Ennui, and Embarrassment.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg',
    release_date: '2024-06-11',
    vote_average: 7.7,
    vote_count: 4200,
    original_language: 'en',
    genres: [{ name: 'Animation' }, { name: 'Family' }]
  },
  {
    id: 558449,
    title: 'Gladiator II',
    overview: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.',
    poster_path: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdrop_path: '/euYIwmwkmz95mnEx7vG55J296rP.jpg',
    release_date: '2024-11-13',
    vote_average: 7.5,
    vote_count: 1400,
    original_language: 'en',
    genres: [{ name: 'Action' }, { name: 'Adventure' }]
  }
];

/**
 * Searches TMDB for movies
 */
export const searchTmdbMovies = async (query, page = 1) => {
  if (!isTmdbConfigured()) {
    const filtered = FALLBACK_TMDB_MOVIES.filter((m) =>
      m.title.toLowerCase().includes((query || '').toLowerCase())
    );
    return {
      results: filtered.map(formatTmdbMovie),
      page: 1,
      totalPages: 1,
      totalResults: filtered.length,
      isConfigured: false,
      notice: 'TMDB_API_KEY is not configured in .env. Showing offline fallback results.'
    };
  }

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: ENV.TMDB_API_KEY,
        query,
        page,
        include_adult: false
      },
      timeout: 8000
    });

    return {
      results: res.data.results.map((m) => ({
        tmdbId: m.id,
        title: m.title,
        description: m.overview,
        releaseDate: m.release_date,
        ratingAverage: Math.round(m.vote_average * 10) / 10,
        ratingCount: m.vote_count,
        posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : '',
        bannerUrl: m.backdrop_path ? `${TMDB_IMAGE_BASE}/original${m.backdrop_path}` : ''
      })),
      page: res.data.page,
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
      isConfigured: true
    };
  } catch (err) {
    console.error('TMDB search error:', err.response?.data || err.message);
    throw ApiError.badRequest(`TMDB API Error: ${err.response?.data?.status_message || err.message}`);
  }
};

/**
 * Fetches trending/popular movies from TMDB
 */
export const getTrendingTmdbMovies = async (timeWindow = 'week') => {
  if (!isTmdbConfigured()) {
    return {
      results: FALLBACK_TMDB_MOVIES.map(formatTmdbMovie),
      isConfigured: false,
      notice: 'TMDB_API_KEY is not configured in .env. Showing offline fallback results.'
    };
  }

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
      params: {
        api_key: ENV.TMDB_API_KEY
      },
      timeout: 8000
    });

    return {
      results: res.data.results.map((m) => ({
        tmdbId: m.id,
        title: m.title,
        description: m.overview,
        releaseDate: m.release_date,
        ratingAverage: Math.round(m.vote_average * 10) / 10,
        ratingCount: m.vote_count,
        posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : '',
        bannerUrl: m.backdrop_path ? `${TMDB_IMAGE_BASE}/original${m.backdrop_path}` : ''
      })),
      isConfigured: true
    };
  } catch (err) {
    console.error('TMDB trending error:', err.response?.data || err.message);
    throw ApiError.badRequest(`TMDB API Error: ${err.response?.data?.status_message || err.message}`);
  }
};

/**
 * Fetches full movie details from TMDB with credits, videos & certification
 */
export const getTmdbMovieDetails = async (tmdbId) => {
  if (!isTmdbConfigured()) {
    const found = FALLBACK_TMDB_MOVIES.find((m) => m.id === Number(tmdbId)) || FALLBACK_TMDB_MOVIES[0];
    return {
      movie: formatTmdbMovie(found),
      isConfigured: false,
      notice: 'TMDB_API_KEY is not configured in .env. Showing offline mock data.'
    };
  }

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: ENV.TMDB_API_KEY,
        append_to_response: 'credits,videos,release_dates'
      },
      timeout: 8000
    });

    return {
      movie: formatTmdbMovie(res.data),
      isConfigured: true
    };
  } catch (err) {
    console.error('TMDB details error:', err.response?.data || err.message);
    throw ApiError.badRequest(`TMDB API Error: ${err.response?.data?.status_message || err.message}`);
  }
};
