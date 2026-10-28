import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { theatreService } from '../services/theatreService';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { SeatMatrix } from '../components/booking/SeatMatrix';
import { SeatLegend } from '../components/booking/SeatLegend';
import { PriceBreakdown } from '../components/booking/PriceBreakdown';
import { Loader } from '../components/common/Loader';

export const ShowtimeBooking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    activeShowtime,
    setActiveShowtime,
    selectedSeats,
    toggleSeat,
    clearBooking,
    priceSummary
  } = useBooking();

  const [occupancyData, setOccupancyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear previously selected seats on entering a new showtime
    clearBooking();

    const fetchOccupancy = async () => {
      setLoading(true);
      try {
        const res = await theatreService.getShowtimeSeats(showtimeId);
        setOccupancyData(res.data);
        setActiveShowtime(res.data.showtime);
      } catch (err) {
        console.error('Failed to load showtime seat map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancy();
  }, [showtimeId]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <Loader message="Generating auditorium seat map & availability..." />;
  }

  if (!occupancyData) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Showtime not found or unavailable</h4>
        <Link to="/movies" className="btn btn-cinema mt-3">Return to Movies</Link>
      </div>
    );
  }

  const { movie, theatre, screen, showtime, stats, seats } = occupancyData;
  const showDate = new Date(showtime.startTime);

  return (
    <div className="container py-4">
      {/* Top Header Information */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 pb-3 border-bottom border-secondary border-opacity-50 gap-2">
        <div>
          <Link to={`/movies/${movie._id}`} className="text-secondary small text-decoration-none mb-1 d-inline-block hover-text-white">
            <i className="bi bi-arrow-left me-1"></i> Back to Movie
          </Link>
          <h2 className="text-white fw-bold mb-1 brand-font">{movie.title}</h2>
          <p className="text-secondary small mb-0">
            <span className="text-white fw-semibold">{theatre.name}</span> ({theatre.city}) •{' '}
            <span className="text-danger fw-semibold">{screen.name}</span> •{' '}
            {showDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
            at {showDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}{' '}
            <span className="badge bg-danger bg-opacity-25 text-danger border border-danger ms-1">{showtime.format}</span>
          </p>
        </div>

        {/* Live Availability Stats */}
        <div className="d-flex gap-2">
          <div className="badge bg-dark border border-secondary text-light p-2 px-3 text-start">
            <span className="text-secondary extra-small d-block">Available</span>
            <span className="fw-bold fs-6 text-success">{stats.availableSeats}</span>
            <span className="text-secondary extra-small"> / {stats.totalSeats}</span>
          </div>
        </div>
      </div>

      {/* Main Seat Selector & Summary Grid */}
      <div className="row g-4">
        {/* Left Col: Interactive Auditorium Seat Map */}
        <div className="col-lg-8">
          {/* Seat Status & Tier Legend */}
          <SeatLegend pricing={showtime.pricing} />

          {/* Seat Matrix */}
          <SeatMatrix
            seats={seats}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />
        </div>

        {/* Right Col: Sticky Price Breakdown & Checkout Action */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '85px' }}>
            <PriceBreakdown
              movie={movie}
              theatre={theatre}
              screen={screen}
              showtime={showtime}
              selectedSeats={selectedSeats}
              priceSummary={priceSummary}
              onProceed={handleProceedToCheckout}
              proceedButtonText={isAuthenticated ? 'Proceed to Checkout' : 'Sign In & Checkout'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
