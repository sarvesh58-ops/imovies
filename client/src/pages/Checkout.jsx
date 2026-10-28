import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingService } from '../services/bookingService';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { activeShowtime, selectedSeats, priceSummary, clearBooking } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({ isRazorpayConfigured: false, keyId: '' });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Card fields for Card simulator
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await bookingService.getPaymentConfig();
        if (res.data) {
          setPaymentConfig(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch payment config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Guard: If no seats selected, redirect
  if (!activeShowtime || !selectedSeats || selectedSeats.length === 0) {
    return <Navigate to="/movies" replace />;
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'IMOVIE20') {
      const discount = Number(((priceSummary.subtotal || 0) * 0.2).toFixed(2));
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      showToast('Coupon IMOVIE20 applied! 20% discount granted.', 'success');
    } else if (code === 'CINEMA10') {
      const discount = Number(((priceSummary.subtotal || 0) * 0.1).toFixed(2));
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      showToast('Coupon CINEMA10 applied! 10% discount granted.', 'success');
    } else {
      showToast('Invalid or expired coupon code. Try IMOVIE20 or CINEMA10.', 'warning');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setAppliedCoupon('');
    showToast('Coupon removed.', 'info');
  };

  const finalTotal = Math.max(0, Number(((priceSummary.totalAmount || 0) - discountAmount).toFixed(2)));

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (paymentMethod === 'Razorpay') {
        // 1. Create order on backend
        const orderRes = await bookingService.createRazorpayOrder({
          showtimeId: activeShowtime._id,
          seatIds: selectedSeats.map((s) => s._id)
        });

        const orderData = orderRes.data;

        // If in evaluation mode (simulated order)
        if (orderData.isSimulated || !window.Razorpay) {
          // Verify with simulated credentials directly
          const confirmRes = await bookingService.verifyRazorpayPayment({
            showtimeId: activeShowtime._id,
            seatIds: selectedSeats.map((s) => s._id),
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: 'simulated_signature'
          });

          showToast('Payment verified! Booking confirmed successfully.', 'success');
          clearBooking();
          navigate(`/booking/success/${confirmRes.data._id}`);
          return;
        }

        // Live Razorpay popup
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'IMovies Cinema',
          description: `${activeShowtime.movie?.title || 'Movie'} Tickets (${selectedSeats.length} seats)`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              const confirmRes = await bookingService.verifyRazorpayPayment({
                showtimeId: activeShowtime._id,
                seatIds: selectedSeats.map((s) => s._id),
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              showToast('Payment confirmed! Your digital ticket is ready.', 'success');
              clearBooking();
              navigate(`/booking/success/${confirmRes.data._id}`);
            } catch (verErr) {
              showToast(verErr.message || 'Signature verification failed', 'error');
              setSubmitting(false);
            }
          },
          prefill: {
            name: user?.name || 'Guest Moviegoer',
            email: user?.email || 'user@imovies.com',
            contact: user?.phone || '9999999999'
          },
          theme: {
            color: '#e50914'
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              showToast('Payment modal closed. You can retry anytime.', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failRes) => {
          showToast(`Payment Failed: ${failRes.error?.description || 'Declined'}`, 'error');
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // Standard payment method simulator (Card / UPI / Net Banking)
        const payload = {
          showtimeId: activeShowtime._id,
          seatIds: selectedSeats.map((s) => s._id),
          paymentMethod
        };

        const res = await bookingService.createBooking(payload);
        showToast('Booking confirmed successfully!', 'success');
        clearBooking();
        navigate(`/booking/success/${res.data._id}`);
      }
    } catch (err) {
      showToast(err.message || 'Payment or reservation failed', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        {/* Left Col: Order Review & Payment Options */}
        <div className="col-lg-7">
          <div className="card glass-panel border-secondary p-4 mb-4">
            <h4 className="text-white fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-shield-check text-danger"></i> Complete Payment
            </h4>
            <p className="text-secondary small mb-4">
              Review your ticket allocation and choose a secure payment gateway
            </p>

            {/* Payment Method Selector */}
            <label className="text-secondary extra-small text-uppercase fw-semibold mb-2">
              Select Payment Gateway
            </label>
            <div className="row g-2 mb-4">
              {['Razorpay', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'].map((method) => (
                <div key={method} className="col-6 col-sm-4 col-md">
                  <button
                    type="button"
                    className={`btn btn-sm w-100 py-2.5 rounded-3 d-flex flex-column align-items-center gap-1 ${
                      paymentMethod === method
                        ? 'btn-danger shadow-sm'
                        : 'btn-dark border-secondary text-secondary'
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <i
                      className={`bi ${
                        method === 'Razorpay'
                          ? 'bi-lightning-charge-fill'
                          : method.includes('Card')
                          ? 'bi-credit-card'
                          : method === 'UPI'
                          ? 'bi-qr-code-scan'
                          : 'bi-bank'
                      } fs-5`}
                    ></i>
                    <span className="extra-small fw-semibold">{method}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Form */}
            <form onSubmit={handleConfirmPayment}>
              {paymentMethod === 'Razorpay' ? (
                <div className="p-4 rounded-3 bg-dark border border-secondary border-opacity-50 text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <span className="badge bg-danger fs-6 px-3 py-1.5 fw-bold">
                      <i className="bi bi-wallet2 me-1"></i> Razorpay Payment Gateway
                    </span>
                    {paymentConfig.isRazorpayConfigured ? (
                      <span className="badge bg-success bg-opacity-25 text-success border border-success">
                        Live Gateway Active
                      </span>
                    ) : (
                      <span className="badge bg-info bg-opacity-25 text-info border border-info" title="Provide RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env">
                        Sandbox Simulator
                      </span>
                    )}
                  </div>
                  <p className="text-secondary small mb-3">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Digital Wallets via Razorpay.
                  </p>
                  <div className="text-secondary extra-small border-top border-secondary border-opacity-25 pt-2">
                    <i className="bi bi-shield-lock-fill text-success me-1"></i>
                    End-to-end encrypted with HMAC SHA256 cryptographic signature validation.
                  </div>
                </div>
              ) : paymentMethod.includes('Card') ? (
                <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50 mb-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Card Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white font-monospace"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-secondary small fw-semibold">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-black border-secondary text-white font-monospace"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small fw-semibold">CVV</label>
                      <input
                        type="password"
                        className="form-control form-control-sm bg-black border-secondary text-white font-monospace"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-3 bg-dark border border-secondary border-opacity-50 text-center mb-4">
                  <i className="bi bi-shield-check text-success fs-1 mb-2 d-block"></i>
                  <h6 className="text-white fw-bold mb-1">Instant {paymentMethod} Gateway Simulator</h6>
                  <p className="text-secondary extra-small mb-0">
                    Evaluation mode enabled. Proceeding will confirm your reservation instantly.
                  </p>
                </div>
              )}

              {/* Coupon / Discount Code Box */}
              <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50 mb-4">
                <label className="text-secondary extra-small text-uppercase fw-semibold mb-2 d-block">
                  Have a Promo Code or Voucher?
                </label>
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between bg-success bg-opacity-10 border border-success rounded-3 p-2 px-3">
                    <span className="small text-success fw-bold">
                      <i className="bi bi-tag-fill me-1"></i> {appliedCoupon} applied (${discountAmount.toFixed(2)} off)
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control bg-black border-secondary text-white text-uppercase"
                      placeholder="Try IMOVIE20 or CINEMA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      className="btn btn-cinema-outline"
                      type="button"
                      onClick={handleApplyCoupon}
                    >
                      Apply Code
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Confirmation */}
              <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50 mb-4">
                <span className="text-secondary extra-small text-uppercase fw-semibold mb-1 d-block">
                  Booking Pass & Invoice Sent To:
                </span>
                <span className="text-white fw-bold small d-block">
                  {user?.name || 'Verified Moviegoer'} ({user?.email})
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-cinema w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Securing Seats & Confirming Ticket...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill"></i>
                    <span>
                      {paymentMethod === 'Razorpay' ? 'Proceed with Razorpay' : 'Confirm & Pay'}{' '}
                      ${finalTotal.toFixed(2)}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Order Breakdown */}
        <div className="col-lg-5">
          <div className="card glass-panel border-secondary p-4 sticky-top" style={{ top: '85px' }}>
            <h5 className="text-white fw-bold mb-3">Order Summary</h5>

            {/* Movie Info */}
            <div className="mb-3 pb-3 border-bottom border-secondary border-opacity-50">
              <h6 className="text-white fw-bold mb-1">{activeShowtime.movie?.title}</h6>
              <p className="text-secondary small mb-1">
                {activeShowtime.theatre?.name} • {activeShowtime.screen?.name}
              </p>
              <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                {activeShowtime.format || '2D'}
              </span>
            </div>

            {/* Selected Seats Badges */}
            <div className="mb-3">
              <label className="text-secondary extra-small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.75rem' }}>
                Allocated Seats ({selectedSeats.length})
              </label>
              <div className="d-flex flex-wrap gap-2">
                {selectedSeats.map((s) => (
                  <span key={s._id} className="badge bg-dark border border-info text-info py-1.5 px-2.5">
                    {s.seatCode} • {s.tier} (${s.price?.toFixed(2)})
                  </span>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="py-3 border-top border-bottom border-secondary border-opacity-50 mb-3">
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Subtotal ({priceSummary.seatCount} Tickets)</span>
                <span className="text-white fw-semibold">${priceSummary.subtotal?.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success small mb-2">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="fw-semibold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Convenience Fee</span>
                <span className="text-white fw-semibold">${priceSummary.convenienceFee?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Taxes (18%)</span>
                <span className="text-white fw-semibold">${priceSummary.taxes?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-white fw-bold fs-5 pt-2 border-top border-secondary border-opacity-25 mt-2">
                <span>Total Due</span>
                <span className="text-danger">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <p className="extra-small text-secondary mb-0 text-center" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-shield-lock-fill text-success me-1"></i>
              256-bit SSL encrypted • Atomic double-booking lock active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
