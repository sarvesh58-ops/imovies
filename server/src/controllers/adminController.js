import * as adminService from '../services/adminService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return ApiResponse.success(res, stats, 'Admin dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const getPopularMovies = async (req, res, next) => {
  try {
    const analytics = await adminService.getPopularMoviesAnalytics();
    return ApiResponse.success(res, analytics, 'Popular movies analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTheatrePerformance = async (req, res, next) => {
  try {
    const performance = await adminService.getTheatrePerformanceAnalytics();
    return ApiResponse.success(res, performance, 'Theatre performance analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await adminService.listAllBookings({ page, limit, search, status });
    return ApiResponse.success(res, result.bookings, 'All bookings retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await adminService.listAllUsers({ page, limit, search, role });
    return ApiResponse.success(res, result.users, 'All users retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);
    return ApiResponse.success(res, user, 'User role updated');
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await adminService.toggleUserStatus(req.params.id, isActive);
    return ApiResponse.success(res, user, 'User status updated');
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminService.listAllReviews({ page, limit, status });
    return ApiResponse.success(res, result.reviews, 'All reviews retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await adminService.updateReviewStatus(req.params.id, status);
    return ApiResponse.success(res, review, 'Review status updated');
  } catch (error) {
    next(error);
  }
};
