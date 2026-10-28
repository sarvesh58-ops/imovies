import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Movie } from '../models/Movie.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || 1, 10));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || 10, 10)));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ movie: movieId, status: 'approved' })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ movie: movieId, status: 'approved' })
    ]);

    return ApiResponse.success(res, reviews, 'Reviews retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw ApiError.notFound('Movie not found');
    }

    // Check if user already submitted a review
    const existing = await Review.findOne({ movie: movieId, user: userId });
    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this movie');
    }

    // Check if user booked tickets for this movie
    const verifiedBooking = await Booking.findOne({
      user: userId,
      movie: movieId,
      bookingStatus: BOOKING_STATUS.CONFIRMED
    });

    const review = await Review.create({
      movie: movieId,
      user: userId,
      rating,
      title: title || '',
      comment,
      isVerifiedBooking: !!verifiedBooking,
      status: 'approved'
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    return ApiResponse.created(res, populated, 'Review posted successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to delete this review');
    }

    await Review.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
