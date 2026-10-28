import api from './api';

export const adminService = {
  getStats: async () => {
    return api.get('/admin/stats');
  },
  getPopularMovies: async () => {
    return api.get('/admin/popular-movies');
  },
  getTheatrePerformance: async () => {
    return api.get('/admin/theatre-performance');
  },
  getBookings: async (params = {}) => {
    return api.get('/admin/bookings', { params });
  },
  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },
  updateUserRole: async (userId, role) => {
    return api.put(`/admin/users/${userId}/role`, { role });
  },
  toggleUserStatus: async (userId, isActive) => {
    return api.put(`/admin/users/${userId}/status`, { isActive });
  },
  getReviews: async (params = {}) => {
    return api.get('/admin/reviews', { params });
  },
  updateReviewStatus: async (reviewId, status) => {
    return api.put(`/admin/reviews/${reviewId}/status`, { status });
  },
  // Entity management
  createMovie: async (movieData) => {
    return api.post('/movies', movieData);
  },
  updateMovie: async (id, movieData) => {
    return api.put(`/movies/${id}`, movieData);
  },
  deleteMovie: async (id) => {
    return api.delete(`/movies/${id}`);
  },
  createTheatre: async (theatreData) => {
    return api.post('/theatres', theatreData);
  },
  updateTheatre: async (id, theatreData) => {
    return api.put(`/theatres/${id}`, theatreData);
  },
  deleteTheatre: async (id) => {
    return api.delete(`/theatres/${id}`);
  },
  addScreen: async (theatreId, screenData) => {
    return api.post(`/theatres/${theatreId}/screens`, screenData);
  },
  deleteScreen: async (screenId) => {
    return api.delete(`/screens/${screenId}`);
  },
  createShowtime: async (showtimeData) => {
    return api.post('/showtimes', showtimeData);
  },
  updateShowtime: async (id, showtimeData) => {
    return api.put(`/showtimes/${id}`, showtimeData);
  },
  deleteShowtime: async (id) => {
    return api.delete(`/showtimes/${id}`);
  }
};
