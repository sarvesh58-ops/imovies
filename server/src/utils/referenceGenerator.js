import crypto from 'crypto';

/**
 * Generates a unique, collision-resistant booking reference code
 * Format: IMV-YYYYMMDD-XXXXXX (e.g. IMV-20261025-9K2M4P)
 */
export const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `IMV-${dateStr}-${randomChars}`;
};

/**
 * Generates mock transaction reference for payments
 */
export const generateTransactionId = (method = 'CARD') => {
  const prefix = method.toUpperCase().slice(0, 3);
  const time = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${prefix}-${time}-${rand}`;
};
