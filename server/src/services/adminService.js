import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Showtime } from '../models/Showtime.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { ApiError } from '../utils/apiError.js';

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalMovies,
    totalTheatres,
    totalShowtimes,
    totalBookings,
    revenueAggregation,
    recentBookings
  ] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Theatre.countDocuments(),
    Showtime.countDocuments({ status: 'active' }),
    Booking.countDocuments({ bookingStatus: BOOKING_STATUS.CONFIRMED }),
    Booking.aggregate([
      { $match: { bookingStatus: BOOKING_STATUS.CONFIRMED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSeatsSold: { $sum: { $size: '$seats' } },
          avgTicketValue: { $avg: '$totalAmount' }
        }
      }
    ]),
    Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theatre', 'name city')
      .sort({ createdAt: -1 })
      .limit(6)
  ]);

  const revenueData = revenueAggregation[0] || {
    totalRevenue: 0,
    totalSeatsSold: 0,
    avgTicketValue: 0
  };

  return {
    kpis: {
      totalRevenue: Math.round(revenueData.totalRevenue * 100) / 100,
      totalSeatsSold: revenueData.totalSeatsSold,
      avgTicketValue: Math.round(revenueData.avgTicketValue * 100) / 100,
      totalBookings,
      totalUsers,
      totalMovies,
      totalTheatres,
      activeShowtimes: totalShowtimes
    },
    recentBookings
  };
};

export const getPopularMoviesAnalytics = async () => {
  return Booking.aggregate([
    { $match: { bookingStatus: BOOKING_STATUS.CONFIRMED } },
    {
      $group: {
        _id: '$movie',
        bookingsCount: { $sum: 1 },
        seatsSold: { $sum: { $size: '$seats' } },
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movieDetails'
      }
    },
    { $unwind: '$movieDetails' },
    {
      $project: {
        _id: 1,
        title: '$movieDetails.title',
        posterUrl: '$movieDetails.posterUrl',
        genres: '$movieDetails.genres',
        ratingAverage: '$movieDetails.ratingAverage',
        bookingsCount: 1,
        seatsSold: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] }
      }
    }
  ]);
};

export const getTheatrePerformanceAnalytics = async () => {
  return Booking.aggregate([
    { $match: { bookingStatus: BOOKING_STATUS.CONFIRMED } },
    {
      $group: {
        _id: '$theatre',
        bookingsCount: { $sum: 1 },
        seatsSold: { $sum: { $size: '$seats' } },
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'theatres',
        localField: '_id',
        foreignField: '_id',
        as: 'theatreDetails'
      }
    },
    { $unwind: '$theatreDetails' },
    {
      $project: {
        _id: 1,
        name: '$theatreDetails.name',
        city: '$theatreDetails.city',
        bookingsCount: 1,
        seatsSold: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] }
      }
    }
  ]);
};

export const listAllBookings = async ({ page = 1, limit = 15, search, status }) => {
  const query = {};
  if (status && status !== 'all') {
    query.bookingStatus = status;
  }
  if (search && search.trim()) {
    query.$or = [
      { bookingReference: { $regex: search.trim(), $options: 'i' } },
      { paymentTransactionId: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theatre', 'name city')
      .populate('screen', 'name')
      .populate('showtime', 'startTime format')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Booking.countDocuments(query)
  ]);

  return {
    bookings,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

export const listAllUsers = async ({ page = 1, limit = 15, search, role }) => {
  const query = {};
  if (role && role !== 'all') {
    query.role = role;
  }
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query)
  ]);

  return {
    users,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

export const updateUserRole = async (userId, newRole) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export const listAllReviews = async ({ page = 1, limit = 15, status }) => {
  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(query)
  ]);

  return {
    reviews,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

export const updateReviewStatus = async (reviewId, newStatus) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { status: newStatus },
    { new: true }
  );
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  await Review.calculateAverageRating(review.movie);
  return review;
};
