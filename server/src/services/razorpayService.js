import crypto from 'crypto';
import Razorpay from 'razorpay';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

let razorpayInstance = null;

export const isRazorpayConfigured = () => {
  return Boolean(
    ENV.RAZORPAY_KEY_ID &&
    ENV.RAZORPAY_KEY_SECRET &&
    ENV.RAZORPAY_KEY_ID.trim() !== '' &&
    ENV.RAZORPAY_KEY_SECRET.trim() !== ''
  );
};

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

/**
 * Creates an order on Razorpay (or generates a simulated order for dev/eval when keys are absent)
 */
export const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const amountInPaise = Math.round(amount * 100);

  if (!isRazorpayConfigured()) {
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency,
      keyId: 'rzp_test_simulated_mode',
      isSimulated: true,
      notice: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set in .env. Running in simulator mode.'
    };
  }

  try {
    const instance = getRazorpayInstance();
    const order = await instance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt.substring(0, 40),
      notes
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: ENV.RAZORPAY_KEY_ID,
      isSimulated: false
    };
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    throw ApiError.badRequest(`Payment Gateway Error: ${err.error?.description || err.message}`);
  }
};

/**
 * Verifies Razorpay payment signature cryptographically
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId) {
    return false;
  }

  // Handle simulated payments
  if (!isRazorpayConfigured() || orderId.startsWith('order_sim_')) {
    return true;
  }

  if (!signature) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
};
