import mongoose from 'mongoose';
import { SEAT_TIERS } from '../constants/seatTiers.js';

const seatSchema = new mongoose.Schema(
  {
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
      index: true
    },
    row: {
      type: String,
      required: [true, 'Row identifier is required'],
      trim: true,
      uppercase: true
    },
    number: {
      type: Number,
      required: [true, 'Seat number is required'],
      min: 1
    },
    seatCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    tier: {
      type: String,
      enum: Object.values(SEAT_TIERS),
      default: SEAT_TIERS.STANDARD
    },
    isAvailable: {
      type: Boolean,
      default: true // false if damaged or reserved for maintenance
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to guarantee no duplicate seat within a screen
seatSchema.index({ screen: 1, row: 1, number: 1 }, { unique: true });
seatSchema.index({ screen: 1, seatCode: 1 });

export const Seat = mongoose.model('Seat', seatSchema);
