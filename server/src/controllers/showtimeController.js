import * as showtimeService from '../services/showtimeService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getShowtime = async (req, res, next) => {
  try {
    const showtime = await showtimeService.getShowtimeById(req.params.id);
    return ApiResponse.success(res, showtime, 'Showtime details retrieved');
  } catch (error) {
    next(error);
  }
};

export const getSeatsOccupancy = async (req, res, next) => {
  try {
    const data = await showtimeService.getShowtimeSeatOccupancy(req.params.id);
    return ApiResponse.success(res, data, 'Seat layout and availability retrieved');
  } catch (error) {
    next(error);
  }
};

export const createShowtime = async (req, res, next) => {
  try {
    const showtime = await showtimeService.createShowtime(req.body);
    return ApiResponse.created(res, showtime, 'Showtime created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateShowtime = async (req, res, next) => {
  try {
    const showtime = await showtimeService.updateShowtime(req.params.id, req.body);
    return ApiResponse.success(res, showtime, 'Showtime updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteShowtime = async (req, res, next) => {
  try {
    const result = await showtimeService.deleteShowtime(req.params.id);
    return ApiResponse.success(res, result, 'Showtime deleted successfully');
  } catch (error) {
    next(error);
  }
};
