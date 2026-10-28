import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Showtime } from '../models/Showtime.js';
import { ApiError } from '../utils/apiError.js';
import { SEAT_TIERS } from '../constants/seatTiers.js';

export const listTheatres = async ({ city, search }) => {
  const query = { isActive: true };
  if (city && city !== 'all') {
    query.city = new RegExp(`^${city}$`, 'i');
  }
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { address: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  return Theatre.find(query).populate({
    path: 'screens',
    select: 'name screenType soundSystem totalSeats'
  }).sort({ city: 1, name: 1 });
};

export const getTheatreById = async (id) => {
  const theatre = await Theatre.findById(id).populate({
    path: 'screens',
    select: 'name screenType soundSystem totalSeats layoutConfig'
  });
  if (!theatre) {
    throw ApiError.notFound('Theatre not found');
  }
  return theatre;
};

export const createTheatre = async (data) => {
  return Theatre.create(data);
};

export const updateTheatre = async (id, data) => {
  const theatre = await Theatre.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!theatre) {
    throw ApiError.notFound('Theatre not found');
  }
  return theatre;
};

export const deleteTheatre = async (id) => {
  const theatre = await Theatre.findByIdAndDelete(id);
  if (!theatre) {
    throw ApiError.notFound('Theatre not found');
  }
  const screens = await Screen.find({ theatre: id });
  const screenIds = screens.map(s => s._id);
  await Seat.deleteMany({ screen: { $in: screenIds } });
  await Screen.deleteMany({ theatre: id });
  await Showtime.deleteMany({ theatre: id });
  return { message: 'Theatre and related screens/seats/showtimes deleted' };
};

/**
 * Creates a Screen and automatically generates all corresponding Seat documents
 */
export const createScreenWithSeats = async (theatreId, screenData) => {
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw ApiError.notFound('Theatre not found');
  }

  const {
    name,
    screenType = '2D',
    soundSystem = 'Dolby Atmos 7.1',
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    columns = 12,
    tiers = [
      { tierName: SEAT_TIERS.STANDARD, rows: ['A', 'B', 'C', 'D'], priceMultiplier: 1.0 },
      { tierName: SEAT_TIERS.PREMIUM, rows: ['E', 'F', 'G'], priceMultiplier: 1.3 },
      { tierName: SEAT_TIERS.VIP, rows: ['H'], priceMultiplier: 1.7 }
    ]
  } = screenData;

  const totalSeats = rows.length * columns;

  const screen = await Screen.create({
    theatre: theatreId,
    name,
    screenType,
    soundSystem,
    totalSeats,
    layoutConfig: { rows, columns, tiers }
  });

  // Generate Seat documents
  const seatDocs = [];
  for (const row of rows) {
    let tier = SEAT_TIERS.STANDARD;
    for (const t of tiers) {
      if (t.rows.includes(row)) {
        tier = t.tierName;
        break;
      }
    }

    for (let col = 1; col <= columns; col++) {
      seatDocs.push({
        screen: screen._id,
        row,
        number: col,
        seatCode: `${row}${col}`,
        tier,
        isAvailable: true
      });
    }
  }

  await Seat.insertMany(seatDocs);
  return screen;
};

export const getScreenById = async (screenId) => {
  const screen = await Screen.findById(screenId).populate('theatre', 'name city address');
  if (!screen) {
    throw ApiError.notFound('Screen not found');
  }
  const seats = await Seat.find({ screen: screenId }).sort({ row: 1, number: 1 });
  return {
    screen,
    seats
  };
};

export const deleteScreen = async (screenId) => {
  const screen = await Screen.findByIdAndDelete(screenId);
  if (!screen) {
    throw ApiError.notFound('Screen not found');
  }
  await Seat.deleteMany({ screen: screenId });
  await Showtime.deleteMany({ screen: screenId });
  return { message: 'Screen and all associated seats/showtimes removed successfully' };
};
