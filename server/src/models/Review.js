import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-10)'],
      min: [1, 'Minimum rating is 1'],
      max: [10, 'Maximum rating is 10']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isVerifiedBooking: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// One review per user per movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

// Static method to recalculate movie average rating
reviewSchema.statics.calculateAverageRating = async function (movieId) {
  const stats = await this.aggregate([
    {
      $match: { movie: new mongoose.Types.ObjectId(movieId), status: 'approved' }
    },
    {
      $group: {
        _id: '$movie',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Movie').findByIdAndUpdate(movieId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
      ratingCount: stats[0].numReviews
    });
  } else {
    await mongoose.model('Movie').findByIdAndUpdate(movieId, {
      ratingAverage: 0,
      ratingCount: 0
    });
  }
};

// Recalculate on save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.movie);
});

// Recalculate on delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.movie);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
