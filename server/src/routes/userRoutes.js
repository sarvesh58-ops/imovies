import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileValidator, changePasswordValidator } from '../validators/authValidators.js';

const router = Router();

router.use(protect); // All user profile routes require authentication

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileValidator), updateProfile);
router.put('/change-password', validate(changePasswordValidator), changePassword);

export default router;
