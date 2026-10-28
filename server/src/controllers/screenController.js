import * as theatreService from '../services/theatreService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getScreen = async (req, res, next) => {
  try {
    const data = await theatreService.getScreenById(req.params.id);
    return ApiResponse.success(res, data, 'Screen and seats retrieved');
  } catch (error) {
    next(error);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const result = await theatreService.deleteScreen(req.params.id);
    return ApiResponse.success(res, result, 'Screen deleted successfully');
  } catch (error) {
    next(error);
  }
};
