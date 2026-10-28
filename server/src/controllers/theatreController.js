import * as theatreService from '../services/theatreService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const theatres = await theatreService.listTheatres({ city, search });
    return ApiResponse.success(res, theatres, 'Theatres retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.getTheatreById(req.params.id);
    return ApiResponse.success(res, theatre, 'Theatre details retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.createTheatre(req.body);
    return ApiResponse.created(res, theatre, 'Theatre created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.updateTheatre(req.params.id, req.body);
    return ApiResponse.success(res, theatre, 'Theatre updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTheatre = async (req, res, next) => {
  try {
    const result = await theatreService.deleteTheatre(req.params.id);
    return ApiResponse.success(res, result, 'Theatre deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addScreenToTheatre = async (req, res, next) => {
  try {
    const screen = await theatreService.createScreenWithSeats(req.params.id, req.body);
    return ApiResponse.created(res, screen, 'Screen and seats generated successfully');
  } catch (error) {
    next(error);
  }
};
