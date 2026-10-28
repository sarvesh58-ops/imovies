import { getUserProfile, updateUserProfile, changeUserPassword } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user._id);
    return ApiResponse.success(res, profile, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updated = await updateUserProfile(req.user._id, { name, phone, avatar });
    return ApiResponse.success(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changeUserPassword(req.user._id, { currentPassword, newPassword });
    return ApiResponse.success(res, result, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
