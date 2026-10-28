import { Router } from 'express';
import {
  getStats,
  getPopularMovies,
  getTheatrePerformance,
  getAllBookings,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getAllReviews,
  updateReviewStatus
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Protect all admin routes with JWT and Admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get('/stats', getStats);
router.get('/popular-movies', getPopularMovies);
router.get('/theatre-performance', getTheatrePerformance);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/status', updateReviewStatus);

export default router;
