import { Movie } from '../models/Movie.js';
import { Showtime } from '../models/Showtime.js';
import { ApiError } from '../utils/apiError.js';
import mongoose from 'mongoose';

export const getMovies = async ({
  genre,
  language,
  status,
  search,
  sort = 'releaseDate_desc',
  page = 1,
  limit = 12
}) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (genre && genre !== 'all') {
    query.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
  }

  if (language && language !== 'all') {
    query.languages = { $in: [new RegExp(`^${language}$`, 'i')] };
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { director: { $regex: search.trim(), $options: 'i' } },
      { 'cast.name': { $regex: search.trim(), $options: 'i' } }
    ];
  }

  // Sorting logic
  let sortOption = { releaseDate: -1 };
  if (sort === 'releaseDate_asc') sortOption = { releaseDate: 1 };
  if (sort === 'rating_desc') sortOption = { ratingAverage: -1 };
  if (sort === 'title_asc') sortOption = { title: 1 };
  if (sort === 'title_desc') sortOption = { title: -1 };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [movies, total] = await Promise.all([
    Movie.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Movie.countDocuments(query)
  ]);

  return {
    movies,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

export const getFeaturedMovies = async () => {
  return Movie.find({ status: 'now_showing' })
    .sort({ ratingAverage: -1, releaseDate: -1 })
    .limit(5);
};

export const getMovieById = async (idOrSlug) => {
  let movie;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    movie = await Movie.findById(idOrSlug);
  }
  if (!movie) {
    movie = await Movie.findOne({ slug: idOrSlug });
  }

  if (!movie) {
    throw ApiError.notFound('Movie not found');
  }
  return movie;
};

export const getMovieShowtimes = async (movieId, { date, city }) => {
  const query = {
    movie: new mongoose.Types.ObjectId(movieId),
    status: { $in: ['active', 'scheduled'] }
  };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.startTime = { $gte: startOfDay, $lte: endOfDay };
  } else {
    // Default: showtimes starting from now onwards
    query.startTime = { $gte: new Date(Date.now() - 30 * 60 * 1000) }; // Include showtimes started up to 30 mins ago
  }

  const showtimes = await Showtime.find(query)
    .populate({
      path: 'theatre',
      match: city ? { city: new RegExp(`^${city}$`, 'i') } : {},
      select: 'name city address amenities'
    })
    .populate('screen', 'name screenType soundSystem totalSeats')
    .sort({ startTime: 1 });

  // Filter out any showtimes where theatre did not match the city filter
  const filteredShowtimes = showtimes.filter((st) => st.theatre !== null);

  // Group by Theatre
  const groupedTheatres = {};
  filteredShowtimes.forEach((st) => {
    const theatreId = st.theatre._id.toString();
    if (!groupedTheatres[theatreId]) {
      groupedTheatres[theatreId] = {
        theatre: st.theatre,
        showtimes: []
      };
    }
    groupedTheatres[theatreId].showtimes.push(st);
  });

  return Object.values(groupedTheatres);
};

export const createMovie = async (data) => {
  return Movie.create(data);
};

export const updateMovie = async (id, data) => {
  const movie = await Movie.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!movie) {
    throw ApiError.notFound('Movie not found');
  }
  return movie;
};

export const deleteMovie = async (id) => {
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) {
    throw ApiError.notFound('Movie not found');
  }
  // Remove associated showtimes
  await Showtime.deleteMany({ movie: id });
  return { message: 'Movie and associated showtimes removed successfully' };
};
