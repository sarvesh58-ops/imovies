import { Router } from 'express';
import {
  createBooking,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
  getMyBookings,
  getBooking,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookingValidator } from '../validators/bookingValidators.js';

const router = Router();

// Public payment configuration endpoint
router.get('/payment-config', getPaymentConfig);

// Protected routes below
router.use(protect);

router.post('/', validate(bookingValidator), createBooking);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify-payment', verifyRazorpayPayment);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
