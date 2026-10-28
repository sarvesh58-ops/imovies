import { registerUser, loginUser, getUserProfile } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const result = await registerUser({ name, email, password, phone, role });
    return ApiResponse.created(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user._id);
    return ApiResponse.success(res, profile, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};
