import mongoose from 'mongoose';

const tierConfigSchema = new mongoose.Schema(
  {
    tierName: {
      type: String,
      required: true,
      enum: ['Standard', 'Premium', 'VIP']
    },
    rows: {
      type: [String],
      required: true
    },
    priceMultiplier: {
      type: Number,
      default: 1.0
    }
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true
    },
    screenType: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D'
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1'
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    layoutConfig: {
      rows: {
        type: [String],
        default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      },
      columns: {
        type: Number,
        default: 12
      },
      tiers: [tierConfigSchema]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

screenSchema.virtual('seats', {
  ref: 'Seat',
  localField: '_id',
  foreignField: 'screen'
});

export const Screen = mongoose.model('Screen', screenSchema);
