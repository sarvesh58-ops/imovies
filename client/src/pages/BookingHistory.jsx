import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useToast } from '../context/ToastContext';
import { TicketCard } from '../components/booking/TicketCard';
import { Loader } from '../components/common/Loader';

export const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load user booking history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingBookingId) return;

    setCancelling(true);
    try {
      await bookingService.cancelBooking(cancellingBookingId, cancelReason);
      showToast('Booking cancelled and seats released successfully', 'success');
      setCancellingBookingId(null);
      await fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your ticket bookings..." />;
  }

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">My Bookings</h2>
          <p className="text-secondary small mb-0">View your active cinema passes and past booking history</p>
        </div>
        <Link to="/movies" className="btn btn-cinema btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Book New Movie
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card glass-panel border-secondary p-5 text-center">
          <i className="bi bi-ticket-perforated fs-1 text-secondary opacity-50 mb-3 d-block"></i>
          <h5 className="text-white fw-bold mb-1">No Bookings Yet</h5>
          <p className="text-secondary small mb-4">You have not booked any movie tickets yet.</p>
          <div>
            <Link to="/movies" className="btn btn-cinema btn-sm">Browse What's On</Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'cancelled';
            const showDate = new Date(booking.showtime?.startTime || booking.createdAt);

            return (
              <div key={booking._id} className="col-lg-6">
                <div className="card glass-panel border-secondary p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="font-monospace text-secondary extra-small fw-bold">
                          {booking.bookingReference}
                        </span>
                        <h5 className="text-white fw-bold mb-0 mt-1">{booking.movie?.title}</h5>
                      </div>
                      <span
                        className={`badge ${
                          isCancelled ? 'bg-danger bg-opacity-25 text-danger border border-danger' : 'bg-success bg-opacity-25 text-success border border-success'
                        }`}
                      >
                        {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="row g-2 mb-3 text-secondary small">
                      <div className="col-sm-6">
                        <i className="bi bi-geo-alt text-danger me-1"></i>
                        <span className="text-light fw-semibold">{booking.theatre?.name}</span>
                        <div className="extra-small text-secondary">{booking.screen?.name}</div>
                      </div>
                      <div className="col-sm-6">
                        <i className="bi bi-clock me-1 text-info"></i>
                        <span className="text-light fw-semibold">
                          {showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                          {showDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="extra-small text-secondary">{booking.showtime?.format || '2D'}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-secondary extra-small text-uppercase fw-semibold d-block mb-1">
                        Reserved Seats ({booking.seats?.length || 0})
                      </span>
                      <div className="d-flex flex-wrap gap-1">
                        {booking.seats?.map((seat, i) => (
                          <span key={i} className="badge bg-dark border border-secondary text-info">
                            {seat.seatCode} ({seat.tier})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-top border-secondary border-opacity-50 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <span className="text-secondary extra-small d-block">Total Paid</span>
                      <span className="text-white fw-bold fs-6">${booking.totalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-cinema-outline btn-sm"
                        onClick={() => setSelectedTicket(booking)}
                      >
                        <i className="bi bi-qr-code me-1"></i> View Ticket
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setCancellingBookingId(booking._id)}
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setSelectedTicket(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="text-end mb-2">
                <button
                  type="button"
                  className="btn btn-dark border-secondary rounded-circle btn-sm text-white"
                  onClick={() => setSelectedTicket(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <TicketCard booking={selectedTicket} />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancellingBookingId && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setCancellingBookingId(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary shadow-lg rounded-4 p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-danger bg-opacity-25 text-danger p-3">
                  <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                </div>
                <div>
                  <h5 className="text-white fw-bold mb-1">Confirm Cancellation</h5>
                  <p className="text-secondary small mb-0">Are you sure you want to cancel this booking?</p>
                </div>
              </div>

              <form onSubmit={handleCancelSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Reason for Cancellation</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary text-white"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Change of schedule">Change of schedule</option>
                    <option value="Booked wrong date/time">Booked wrong date/time</option>
                    <option value="Personal emergency">Personal emergency</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <p className="text-secondary extra-small mb-4">
                  Note: Upon cancellation, your reserved seats will be immediately released for other cinema guests and your payment will be marked as refunded.
                </p>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-dark border-secondary btn-sm"
                    onClick={() => setCancellingBookingId(null)}
                    disabled={cancelling}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    disabled={cancelling}
                  >
                    {cancelling ? 'Releasing Seats...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
