import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { TicketCard } from '../components/booking/TicketCard';
import { Loader } from '../components/common/Loader';

export const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        console.error('Failed to load confirmed booking receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return <Loader message="Generating your verified digital cinema ticket..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Booking receipt not found</h4>
        <Link to="/movies" className="btn btn-cinema mt-3">Browse Movies</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25 text-success p-3 mb-2"
          style={{ width: '64px', height: '64px' }}
        >
          <i className="bi bi-check-lg fs-1"></i>
        </div>
        <h2 className="text-white fw-bold brand-font mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small mb-0">
          Your cinema seats have been secured. Show this digital pass at the auditorium entry.
        </p>
      </div>

      {/* Ticket Pass */}
      <TicketCard booking={booking} />

      {/* Footer Navigation */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to="/my-bookings" className="btn btn-cinema-outline btn-sm">
          <i className="bi bi-clock-history me-1"></i> View All Bookings
        </Link>
        <Link to="/" className="btn btn-cinema btn-sm">
          <i className="bi bi-house me-1"></i> Return Home
        </Link>
      </div>
    </div>
  );
};
