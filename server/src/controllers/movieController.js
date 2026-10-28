import * as movieService from '../services/movieService.js';
import * as tmdbService from '../services/tmdbService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllMovies = async (req, res, next) => {
  try {
    const { genre, language, status, search, sort, page, limit } = req.query;
    const result = await movieService.getMovies({
      genre,
      language,
      status,
      search,
      sort,
      page,
      limit
    });
    return ApiResponse.success(res, result.movies, 'Movies retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getFeatured = async (req, res, next) => {
  try {
    const movies = await movieService.getFeaturedMovies();
    return ApiResponse.success(res, movies, 'Featured movies retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    return ApiResponse.success(res, movie, 'Movie details retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMovieShowtimes = async (req, res, next) => {
  try {
    const { date, city } = req.query;
    const showtimesByTheatre = await movieService.getMovieShowtimes(req.params.id, { date, city });
    return ApiResponse.success(res, showtimesByTheatre, 'Movie showtimes retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    return ApiResponse.created(res, movie, 'Movie created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return ApiResponse.success(res, movie, 'Movie updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const result = await movieService.deleteMovie(req.params.id);
    return ApiResponse.success(res, result, 'Movie deleted successfully');
  } catch (error) {
    next(error);
  }
};

// TMDB Integration Controllers
export const searchTmdb = async (req, res, next) => {
  try {
    const { query, page } = req.query;
    const data = await tmdbService.searchTmdbMovies(query, page);
    return ApiResponse.success(res, data, 'TMDB movies search result');
  } catch (error) {
    next(error);
  }
};

export const getTrendingTmdb = async (req, res, next) => {
  try {
    const data = await tmdbService.getTrendingTmdbMovies();
    return ApiResponse.success(res, data, 'TMDB trending movies retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTmdbDetails = async (req, res, next) => {
  try {
    const data = await tmdbService.getTmdbMovieDetails(req.params.tmdbId);
    return ApiResponse.success(res, data, 'TMDB movie details retrieved');
  } catch (error) {
    next(error);
  }
};

export const importFromTmdb = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { status = 'now_showing' } = req.body;
    const { movie } = await tmdbService.getTmdbMovieDetails(tmdbId);

    // Prepare for database insertion
    const moviePayload = {
      ...movie,
      status
    };
    delete moviePayload.tmdbId;

    const importedMovie = await movieService.createMovie(moviePayload);
    return ApiResponse.created(res, importedMovie, 'Movie imported from TMDB successfully');
  } catch (error) {
    next(error);
  }
};
