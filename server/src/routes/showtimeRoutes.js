import { Router } from 'express';
import {
  getShowtime,
  getSeatsOccupancy,
  createShowtime,
  updateShowtime,
  deleteShowtime
} from '../controllers/showtimeController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { showtimeValidator } from '../validators/showtimeValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/:id', getShowtime);
router.get('/:id/seats', getSeatsOccupancy);

// Admin endpoints
router.post('/', protect, authorize(ROLES.ADMIN), validate(showtimeValidator), createShowtime);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(showtimeValidator), updateShowtime);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteShowtime);

export default router;
