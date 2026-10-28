import api from './api';

export const theatreService = {
  getTheatres: async (params = {}) => {
    return api.get('/theatres', { params });
  },
  getTheatreById: async (id) => {
    return api.get(`/theatres/${id}`);
  },
  getShowtimeSeats: async (showtimeId) => {
    return api.get(`/showtimes/${showtimeId}/seats`);
  }
};
