import api from './api';

export const movieService = {
  getMovies: async (params = {}) => {
    return api.get('/movies', { params });
  },
  getFeaturedMovies: async () => {
    return api.get('/movies/featured');
  },
  getMovieById: async (id) => {
    return api.get(`/movies/${id}`);
  },
  getMovieShowtimes: async (movieId, params = {}) => {
    return api.get(`/movies/${movieId}/showtimes`, { params });
  },
  getMovieReviews: async (movieId, params = {}) => {
    return api.get(`/reviews/movie/${movieId}`, { params });
  },
  addReview: async (movieId, reviewData) => {
    return api.post(`/reviews/movie/${movieId}`, reviewData);
  },
  deleteReview: async (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },
  // TMDB Integration
  searchTmdb: async (query, page = 1) => {
    return api.get('/movies/tmdb/search', { params: { query, page } });
  },
  getTrendingTmdb: async () => {
    return api.get('/movies/tmdb/trending');
  },
  getTmdbDetails: async (tmdbId) => {
    return api.get(`/movies/tmdb/${tmdbId}`);
  },
  importFromTmdb: async (tmdbId, data = {}) => {
    return api.post(`/movies/tmdb/import/${tmdbId}`, data);
  }
};
