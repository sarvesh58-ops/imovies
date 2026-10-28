import { Router } from 'express';
import {
  getTheatres,
  getTheatre,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  addScreenToTheatre
} from '../controllers/theatreController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getTheatres);
router.get('/:id', getTheatre);

// Admin endpoints
router.post('/', protect, authorize(ROLES.ADMIN), createTheatre);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateTheatre);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteTheatre);
router.post('/:id/screens', protect, authorize(ROLES.ADMIN), addScreenToTheatre);

export default router;
