import { body } from 'express-validator';

export const showtimeValidator = [
  body('movie')
    .notEmpty()
    .withMessage('Movie ID is required')
    .isMongoId()
    .withMessage('Invalid Movie ID format'),
  body('theatre')
    .notEmpty()
    .withMessage('Theatre ID is required')
    .isMongoId()
    .withMessage('Invalid Theatre ID format'),
  body('screen')
    .notEmpty()
    .withMessage('Screen ID is required')
    .isMongoId()
    .withMessage('Invalid Screen ID format'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO date'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO date'),
  body('format')
    .optional()
    .isIn(['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'])
    .withMessage('Invalid format'),
  body('pricing.standard')
    .notEmpty()
    .withMessage('Standard pricing is required')
    .isFloat({ min: 0 })
    .withMessage('Standard price must be positive'),
  body('pricing.premium')
    .notEmpty()
    .withMessage('Premium pricing is required')
    .isFloat({ min: 0 })
    .withMessage('Premium price must be positive'),
  body('pricing.vip')
    .notEmpty()
    .withMessage('VIP pricing is required')
    .isFloat({ min: 0 })
    .withMessage('VIP price must be positive')
];
