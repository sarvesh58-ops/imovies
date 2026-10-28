import { Router } from 'express';
import { getScreen, deleteScreen } from '../controllers/screenController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/:id', getScreen);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteScreen);

export default router;
