import mongoose from 'mongoose';
import { SEAT_STATUS } from '../constants/bookingStatus.js';

const bookingSeatSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
      index: true
    },
    seatCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [SEAT_STATUS.BOOKED, SEAT_STATUS.RELEASED],
      default: SEAT_STATUS.BOOKED,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// CRITICAL UNIQUE COMPOUND INDEX FOR CONCURRENCY PROTECTION:
// Strictly prevents double bookings for the same seat at the same showtime.
bookingSeatSchema.index(
  { showtime: 1, seat: 1 },
  {
    unique: true,
    partialFilterExpression: { status: SEAT_STATUS.BOOKED }
  }
);

export const BookingSeat = mongoose.model('BookingSeat', bookingSeatSchema);
