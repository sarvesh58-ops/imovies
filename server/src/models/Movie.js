import mongoose from 'mongoose';

const castMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: '' },
    photo: { type: String, default: '' }
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required']
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true
    },
    languages: {
      type: [String],
      required: [true, 'At least one language is required'],
      index: true
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R', 'NC-17'],
      default: 'UA'
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required']
    },
    bannerUrl: {
      type: String,
      required: [true, 'Banner image URL is required']
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    cast: [castMemberSchema],
    director: {
      type: String,
      default: ''
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'now_showing',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Slug generation before save
movieSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Text index for search
movieSchema.index({ title: 'text', description: 'text', director: 'text' });

export const Movie = mongoose.model('Movie', movieSchema);
