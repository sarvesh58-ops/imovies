import { Router } from 'express';
import { getMovieReviews, addReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewValidator } from '../validators/reviewValidators.js';

const router = Router();

// Nested under movie or standalone
router.get('/movie/:movieId', getMovieReviews);
router.post('/movie/:movieId', protect, validate(reviewValidator), addReview);
router.delete('/:id', protect, deleteReview);

export default router;
