import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    return api.post('/bookings', bookingData);
  },
  createRazorpayOrder: async (orderData) => {
    return api.post('/bookings/razorpay/create-order', orderData);
  },
  verifyRazorpayPayment: async (verificationData) => {
    return api.post('/bookings/razorpay/verify-payment', verificationData);
  },
  getPaymentConfig: async () => {
    return api.get('/bookings/payment-config');
  },
  getMyBookings: async () => {
    return api.get('/bookings/my-bookings');
  },
  getBookingById: async (id) => {
    return api.get(`/bookings/${id}`);
  },
  cancelBooking: async (id, reason) => {
    return api.put(`/bookings/${id}/cancel`, { reason });
  }
};
