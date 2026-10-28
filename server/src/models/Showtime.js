import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'],
      default: '2D'
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English'
    },
    pricing: {
      standard: {
        type: Number,
        required: true,
        default: 12.0
      },
      premium: {
        type: Number,
        required: true,
        default: 16.0
      },
      vip: {
        type: Number,
        required: true,
        default: 22.0
      }
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'sold_out', 'cancelled', 'completed'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

showtimeSchema.index({ theatre: 1, startTime: 1 });
showtimeSchema.index({ movie: 1, startTime: 1 });
showtimeSchema.index({ screen: 1, startTime: 1 });

export const Showtime = mongoose.model('Showtime', showtimeSchema);
