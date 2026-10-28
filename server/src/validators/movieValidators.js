import { body } from 'express-validator';

export const movieValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('durationMinutes')
    .notEmpty()
    .withMessage('Duration in minutes is required')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be a positive integer between 1 and 600 minutes'),
  body('releaseDate')
    .notEmpty()
    .withMessage('Release date is required')
    .isISO8601()
    .withMessage('Release date must be a valid date'),
  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  body('languages')
    .isArray({ min: 1 })
    .withMessage('At least one language is required'),
  body('posterUrl')
    .trim()
    .notEmpty()
    .withMessage('Poster URL is required'),
  body('bannerUrl')
    .trim()
    .notEmpty()
    .withMessage('Banner URL is required'),
  body('certificate')
    .optional()
    .isIn(['U', 'UA', 'A', 'PG-13', 'R', 'NC-17'])
    .withMessage('Invalid certificate rating'),
  body('status')
    .optional()
    .isIn(['now_showing', 'coming_soon', 'archived'])
    .withMessage('Invalid movie status')
];
