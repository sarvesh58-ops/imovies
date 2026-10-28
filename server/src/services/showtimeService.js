import { Showtime } from '../models/Showtime.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { BookingSeat } from '../models/BookingSeat.js';
import { ApiError } from '../utils/apiError.js';
import { SEAT_STATUS } from '../constants/bookingStatus.js';

export const getShowtimeById = async (id) => {
  const showtime = await Showtime.findById(id)
    .populate('movie', 'title slug posterUrl durationMinutes certificate languages')
    .populate('theatre', 'name city address amenities')
    .populate('screen', 'name screenType soundSystem layoutConfig totalSeats');
  if (!showtime) {
    throw ApiError.notFound('Showtime not found');
  }
  return showtime;
};

export const getShowtimeSeatOccupancy = async (showtimeId) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('movie', 'title durationMinutes certificate')
    .populate('theatre', 'name city address')
    .populate('screen', 'name screenType layoutConfig totalSeats');

  if (!showtime) {
    throw ApiError.notFound('Showtime not found');
  }

  // 1. Fetch all seats configured for this screen
  const screenSeats = await Seat.find({ screen: showtime.screen._id }).sort({
    row: 1,
    number: 1
  });

  // 2. Fetch all booked seats for this showtime
  const bookedSeats = await BookingSeat.find({
    showtime: showtimeId,
    status: SEAT_STATUS.BOOKED
  }).select('seat seatCode');

  const bookedSeatIdSet = new Set(bookedSeats.map((bs) => bs.seat.toString()));

  // 3. Map seats with dynamic availability status and calculated price
  const mappedSeats = screenSeats.map((s) => {
    const isBooked = bookedSeatIdSet.has(s._id.toString());
    let status = SEAT_STATUS.AVAILABLE;
    if (!s.isAvailable) {
      status = 'maintenance';
    } else if (isBooked) {
      status = SEAT_STATUS.BOOKED;
    }

    // Determine seat price based on tier
    let price = showtime.pricing.standard;
    if (s.tier === 'Premium') price = showtime.pricing.premium;
    if (s.tier === 'VIP') price = showtime.pricing.vip;

    return {
      _id: s._id,
      seatCode: s.seatCode,
      row: s.row,
      number: s.number,
      tier: s.tier,
      price,
      status
    };
  });

  const availableCount = mappedSeats.filter((s) => s.status === SEAT_STATUS.AVAILABLE).length;
  const bookedCount = bookedSeatIdSet.size;

  return {
    showtime: {
      _id: showtime._id,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      format: showtime.format,
      language: showtime.language,
      pricing: showtime.pricing,
      status: showtime.status
    },
    movie: showtime.movie,
    theatre: showtime.theatre,
    screen: showtime.screen,
    layoutConfig: showtime.screen.layoutConfig,
    stats: {
      totalSeats: mappedSeats.length,
      availableSeats: availableCount,
      bookedSeats: bookedCount
    },
    seats: mappedSeats
  };
};

export const createShowtime = async (data) => {
  // Validate that screen belongs to theatre
  const screen = await Screen.findById(data.screen);
  if (!screen) {
    throw ApiError.notFound('Screen not found');
  }
  if (screen.theatre.toString() !== data.theatre.toString()) {
    throw ApiError.badRequest('Selected screen does not belong to the selected theatre');
  }

  // Check for time overlap in the same screen
  const overlap = await Showtime.findOne({
    screen: data.screen,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: new Date(data.endTime) },
        endTime: { $gt: new Date(data.startTime) }
      }
    ]
  });

  if (overlap) {
    throw ApiError.conflict(
      `This screen already has an overlapping showtime scheduled (${overlap.startTime.toLocaleTimeString()} - ${overlap.endTime.toLocaleTimeString()})`
    );
  }

  return Showtime.create(data);
};

export const updateShowtime = async (id, data) => {
  const showtime = await Showtime.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!showtime) {
    throw ApiError.notFound('Showtime not found');
  }
  return showtime;
};

export const deleteShowtime = async (id) => {
  const showtime = await Showtime.findByIdAndDelete(id);
  if (!showtime) {
    throw ApiError.notFound('Showtime not found');
  }
  await BookingSeat.deleteMany({ showtime: id });
  return { message: 'Showtime and associated seat reservations deleted' };
};
