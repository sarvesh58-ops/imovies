import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    contactPhone: {
      type: String,
      default: ''
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Cafeteria']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual relationship to screens
theatreSchema.virtual('screens', {
  ref: 'Screen',
  localField: '_id',
  foreignField: 'theatre'
});

export const Theatre = mongoose.model('Theatre', theatreSchema);
