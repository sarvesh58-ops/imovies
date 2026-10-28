import React from 'react';

export const PriceBreakdown = ({
  movie,
  theatre,
  screen,
  showtime,
  selectedSeats = [],
  priceSummary,
  onProceed,
  proceedButtonText = 'Proceed to Checkout',
  loading = false
}) => {
  if (selectedSeats.length === 0) {
    return (
      <div className="card glass-panel border-secondary p-4 text-center">
        <i className="bi bi-cursor-fill fs-1 text-secondary opacity-50 mb-3"></i>
        <h6 className="text-white fw-bold mb-1">Select Your Seats</h6>
        <p className="text-secondary small mb-0">
          Click on any available seat in the auditorium above to view ticket price and reserve.
        </p>
      </div>
    );
  }

  return (
    <div className="card glass-panel border-secondary p-4">
      <h5 className="text-white fw-bold mb-3 d-flex align-items-center justify-content-between">
        <span>Booking Summary</span>
        <span className="badge bg-danger rounded-pill fs-6 px-3">
          {priceSummary.seatCount} {priceSummary.seatCount === 1 ? 'Seat' : 'Seats'}
        </span>
      </h5>

      {/* Movie & Show Info */}
      <div className="pb-3 border-bottom border-secondary border-opacity-50 mb-3">
        <h6 className="text-white fw-bold mb-1">{movie?.title}</h6>
        <p className="text-secondary small mb-1">
          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
          {theatre?.name} • {screen?.name}
        </p>
        <p className="text-secondary small mb-0">
          <i className="bi bi-calendar-event me-1"></i>
          {showtime?.startTime && new Date(showtime.startTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}{' '}
          at{' '}
          {showtime?.startTime && new Date(showtime.startTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}{' '}
          ({showtime?.format})
        </p>
      </div>

      {/* Selected Seats Badges */}
      <div className="mb-3">
        <label className="text-secondary extra-small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.75rem' }}>
          Selected Seats
        </label>
        <div className="d-flex flex-wrap gap-2">
          {selectedSeats.map((seat) => (
            <span
              key={seat._id}
              className="badge bg-dark border border-info text-info py-2 px-2.5 rounded-3 d-flex align-items-center gap-1"
            >
              <i className="bi bi-ticket-detailed-fill"></i>
              <span className="fw-bold">{seat.seatCode}</span>
              <span className="text-secondary opacity-75">(${seat.price?.toFixed(2)})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="py-3 border-top border-bottom border-secondary border-opacity-50 mb-4">
        <div className="d-flex justify-content-between text-secondary small mb-2">
          <span>Tickets Subtotal</span>
          <span className="text-white fw-semibold">${priceSummary.subtotal?.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between text-secondary small mb-2">
          <span>Convenience Fee</span>
          <span className="text-white fw-semibold">${priceSummary.convenienceFee?.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between text-secondary small mb-2">
          <span>Integrated Taxes (18%)</span>
          <span className="text-white fw-semibold">${priceSummary.taxes?.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between text-white fw-bolder fs-5 pt-2 border-top border-secondary border-opacity-25 mt-2">
          <span>Total Amount</span>
          <span className="text-danger">${priceSummary.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className="btn btn-cinema w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
        disabled={loading}
        onClick={onProceed}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status"></span>
            <span>Securing Seats...</span>
          </>
        ) : (
          <>
            <span>{proceedButtonText}</span>
            <i className="bi bi-arrow-right"></i>
          </>
        )}
      </button>
    </div>
  );
};
