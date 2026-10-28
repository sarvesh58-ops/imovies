import QRCode from 'qrcode';
import { Booking } from '../models/Booking.js';
import { BookingSeat } from '../models/BookingSeat.js';
import { Showtime } from '../models/Showtime.js';
import { Seat } from '../models/Seat.js';
import { ApiError } from '../utils/apiError.js';
import { generateBookingReference, generateTransactionId } from '../utils/referenceGenerator.js';
import { BOOKING_STATUS, PAYMENT_STATUS, SEAT_STATUS } from '../constants/bookingStatus.js';
import { ENV } from '../config/env.js';
import * as razorpayService from './razorpayService.js';

/**
 * Helper to calculate booking breakdown accurately
 */
export const calculatePricing = (seats, showtime) => {
  let subtotal = 0;
  const bookedSeatItems = seats.map((s) => {
    let seatPrice = showtime.pricing.standard;
    if (s.tier === 'Premium') seatPrice = showtime.pricing.premium;
    if (s.tier === 'VIP') seatPrice = showtime.pricing.vip;

    subtotal += seatPrice;

    return {
      seatId: s._id,
      seatCode: s.seatCode,
      tier: s.tier,
      price: seatPrice
    };
  });

  const convenienceFee = Number((ENV.CONVENIENCE_FEE * seats.length).toFixed(2));
  const taxAmount = Number(((subtotal + convenienceFee) * (ENV.TAX_RATE_PERCENTAGE / 100)).toFixed(2));
  const totalAmount = Number((subtotal + convenienceFee + taxAmount).toFixed(2));

  return { subtotal, convenienceFee, taxAmount, totalAmount, bookedSeatItems };
};

/**
 * Validates showtime and requested seats for availability
 */
const validateBookingPreconditions = async (showtimeId, seatIds) => {
  if (!seatIds || seatIds.length === 0) {
    throw ApiError.badRequest('At least one seat must be selected');
  }

  const showtime = await Showtime.findById(showtimeId)
    .populate('movie')
    .populate('theatre')
    .populate('screen');

  if (!showtime) {
    throw ApiError.notFound('Showtime not found');
  }

  if (showtime.status !== 'active') {
    throw ApiError.badRequest(`This showtime is currently ${showtime.status}`);
  }

  const seats = await Seat.find({
    _id: { $in: seatIds },
    screen: showtime.screen._id
  });

  if (seats.length !== seatIds.length) {
    throw ApiError.badRequest('One or more selected seats are invalid for this screen');
  }

  const existingBooked = await BookingSeat.find({
    showtime: showtimeId,
    seat: { $in: seatIds },
    status: SEAT_STATUS.BOOKED
  });

  if (existingBooked.length > 0) {
    const bookedCodes = existingBooked.map((bs) => bs.seatCode).join(', ');
    throw ApiError.conflict(
      `Seat(s) ${bookedCodes} were just booked by another user. Please select alternative seats.`
    );
  }

  return { showtime, seats };
};

/**
 * Create standard booking (Card/UPI simulator or direct confirmed)
 */
export const createBooking = async ({
  userId,
  showtimeId,
  seatIds,
  paymentMethod = 'Credit Card',
  razorpayOrderId = '',
  razorpayPaymentId = ''
}) => {
  const { showtime, seats } = await validateBookingPreconditions(showtimeId, seatIds);

  const { subtotal, convenienceFee, taxAmount, totalAmount, bookedSeatItems } =
    calculatePricing(seats, showtime);

  const bookingReference = generateBookingReference();
  const paymentTransactionId = razorpayPaymentId || generateTransactionId(paymentMethod);

  // Scannable QR Code Payload
  const qrPayload = JSON.stringify({
    ref: bookingReference,
    movie: showtime.movie.title,
    theatre: showtime.theatre.name,
    screen: showtime.screen.name,
    seats: bookedSeatItems.map((s) => s.seatCode),
    time: showtime.startTime
  });

  let qrCodeData = '';
  try {
    qrCodeData = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (qrErr) {
    qrCodeData = qrPayload;
  }

  // Create Booking Document
  const booking = await Booking.create({
    bookingReference,
    user: userId,
    showtime: showtime._id,
    movie: showtime.movie._id,
    theatre: showtime.theatre._id,
    screen: showtime.screen._id,
    seats: bookedSeatItems,
    subtotal,
    convenienceFee,
    taxAmount,
    totalAmount,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod,
    paymentTransactionId,
    razorpayOrderId,
    razorpayPaymentId,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    qrCodeData
  });

  // Atomic reservation of BookingSeat documents with partial unique index protection
  try {
    const bookingSeatsToInsert = seats.map((s) => ({
      showtime: showtime._id,
      seat: s._id,
      seatCode: s.seatCode,
      booking: booking._id,
      status: SEAT_STATUS.BOOKED
    }));

    await BookingSeat.insertMany(bookingSeatsToInsert, { ordered: true });
  } catch (raceErr) {
    await Booking.findByIdAndDelete(booking._id);
    throw ApiError.conflict(
      'Seat reservation conflict. One or more seats were booked simultaneously by another user.'
    );
  }

  return Booking.findById(booking._id)
    .populate('movie', 'title posterUrl durationMinutes certificate languages')
    .populate('theatre', 'name city address amenities')
    .populate('screen', 'name screenType soundSystem')
    .populate('showtime', 'startTime endTime format language')
    .populate('user', 'name email');
};

/**
 * Creates Razorpay Order for checkout initialization
 */
export const createRazorpayOrder = async ({ userId, showtimeId, seatIds }) => {
  const { showtime, seats } = await validateBookingPreconditions(showtimeId, seatIds);
  const { subtotal, convenienceFee, taxAmount, totalAmount, bookedSeatItems } =
    calculatePricing(seats, showtime);

  const receipt = `rcpt_${Date.now()}_${seats.length}`;
  const order = await razorpayService.createOrder({
    amount: totalAmount,
    currency: 'INR',
    receipt,
    notes: {
      userId: userId.toString(),
      showtimeId: showtimeId.toString(),
      movieTitle: showtime.movie.title,
      seats: bookedSeatItems.map((s) => s.seatCode).join(',')
    }
  });

  return {
    ...order,
    breakdown: {
      subtotal,
      convenienceFee,
      taxAmount,
      totalAmount,
      seatCount: seats.length,
      movieTitle: showtime.movie.title,
      theatreName: showtime.theatre.name,
      screenName: showtime.screen.name,
      seats: bookedSeatItems.map((s) => s.seatCode)
    }
  };
};

/**
 * Verifies Razorpay payment signature securely and confirms the booking atomically
 */
export const verifyRazorpayPayment = async ({
  userId,
  showtimeId,
  seatIds,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  if (!razorpayOrderId || !razorpayPaymentId) {
    throw ApiError.badRequest('Razorpay order ID and payment ID are required');
  }

  // Cryptographic signature check
  const isValidSignature = razorpayService.verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  });

  if (!isValidSignature) {
    throw ApiError.badRequest('Razorpay payment signature verification failed. Transaction rejected.');
  }

  // Signature valid -> finalize booking
  return createBooking({
    userId,
    showtimeId,
    seatIds,
    paymentMethod: 'Razorpay',
    razorpayOrderId,
    razorpayPaymentId
  });
};

/**
 * Returns public payment configuration (Never exposes secret key)
 */
export const getPaymentConfig = () => {
  return {
    razorpayKeyId: ENV.RAZORPAY_KEY_ID || '',
    isRazorpayConfigured: razorpayService.isRazorpayConfigured(),
    currency: 'INR'
  };
};

export const getUserBookings = async (userId) => {
  return Booking.find({ user: userId })
    .populate('movie', 'title posterUrl durationMinutes certificate')
    .populate('theatre', 'name city address')
    .populate('screen', 'name screenType')
    .populate('showtime', 'startTime endTime format')
    .sort({ createdAt: -1 });
};

export const getBookingDetails = async (bookingId, userId, userRole) => {
  const query = { _id: bookingId };
  if (userRole !== 'admin') {
    query.user = userId;
  }

  const booking = await Booking.findOne(query)
    .populate('movie', 'title posterUrl bannerUrl durationMinutes certificate languages director')
    .populate('theatre', 'name city address amenities contactPhone')
    .populate('screen', 'name screenType soundSystem')
    .populate('showtime', 'startTime endTime format language')
    .populate('user', 'name email phone');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  return booking;
};

export const cancelBooking = async (bookingId, userId, userRole, reason = 'User requested cancellation') => {
  const query = { _id: bookingId };
  if (userRole !== 'admin') {
    query.user = userId;
  }

  const booking = await Booking.findOne(query).populate('showtime');
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
    throw ApiError.badRequest('This booking is already cancelled');
  }

  const now = new Date();
  const showtimeStart = new Date(booking.showtime.startTime);
  const diffHours = (showtimeStart - now) / (1000 * 60 * 60);

  if (userRole !== 'admin' && diffHours < 1) {
    throw ApiError.badRequest(
      'Bookings cannot be cancelled less than 1 hour before the scheduled showtime'
    );
  }

  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  await booking.save();

  await BookingSeat.updateMany(
    { booking: booking._id },
    { $set: { status: SEAT_STATUS.RELEASED } }
  );

  return booking;
};
