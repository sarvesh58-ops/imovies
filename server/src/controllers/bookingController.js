import * as bookingService from '../services/bookingService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seatIds, paymentMethod } = req.body;
    const booking = await bookingService.createBooking({
      userId: req.user._id,
      showtimeId,
      seatIds,
      paymentMethod
    });
    return ApiResponse.created(res, booking, 'Booking confirmed successfully');
  } catch (error) {
    next(error);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const orderData = await bookingService.createRazorpayOrder({
      userId: req.user._id,
      showtimeId,
      seatIds
    });
    return ApiResponse.success(res, orderData, 'Razorpay order generated');
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { showtimeId, seatIds, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const booking = await bookingService.verifyRazorpayPayment({
      userId: req.user._id,
      showtimeId,
      seatIds,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    return ApiResponse.created(res, booking, 'Razorpay payment verified and booking confirmed');
  } catch (error) {
    next(error);
  }
};

export const getPaymentConfig = async (req, res, next) => {
  try {
    const config = bookingService.getPaymentConfig();
    return ApiResponse.success(res, config, 'Payment configuration retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user._id);
    return ApiResponse.success(res, bookings, 'User bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingDetails(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return ApiResponse.success(res, booking, 'Booking receipt retrieved');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user._id,
      req.user.role,
      reason
    );
    return ApiResponse.success(res, booking, 'Booking cancelled and seats released successfully');
  } catch (error) {
    next(error);
  }
};
