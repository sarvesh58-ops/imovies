import { body } from 'express-validator';

export const bookingValidator = [
  body('showtimeId')
    .notEmpty()
    .withMessage('Showtime ID is required')
    .isMongoId()
    .withMessage('Invalid Showtime ID format'),
  body('seatIds')
    .isArray({ min: 1, max: 10 })
    .withMessage('Please select between 1 and 10 seats per booking'),
  body('seatIds.*')
    .isMongoId()
    .withMessage('Each seat ID must be a valid Mongo ID'),
  body('paymentMethod')
    .optional()
    .isIn(['Credit Card', 'Debit Card', 'UPI', 'Net Banking'])
    .withMessage('Invalid payment method')
];
