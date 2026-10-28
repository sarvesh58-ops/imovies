import { Router } from 'express';
import {
  getAllMovies,
  getFeatured,
  getMovie,
  getMovieShowtimes,
  createMovie,
  updateMovie,
  deleteMovie,
  searchTmdb,
  getTrendingTmdb,
  getTmdbDetails,
  importFromTmdb
} from '../controllers/movieController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { movieValidator } from '../validators/movieValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// TMDB Integration routes (Placed BEFORE /:id route)
router.get('/tmdb/search', searchTmdb);
router.get('/tmdb/trending', getTrendingTmdb);
router.get('/tmdb/:tmdbId', getTmdbDetails);
router.post('/tmdb/import/:tmdbId', protect, authorize(ROLES.ADMIN), importFromTmdb);

// Standard Public routes
router.get('/', getAllMovies);
router.get('/featured', getFeatured);
router.get('/:id', getMovie);
router.get('/:id/showtimes', getMovieShowtimes);

// Admin-only movie routes
router.post('/', protect, authorize(ROLES.ADMIN), validate(movieValidator), createMovie);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(movieValidator), updateMovie);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteMovie);

export default router;
