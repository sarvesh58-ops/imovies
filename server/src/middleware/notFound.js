import { ApiError } from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`));
};
