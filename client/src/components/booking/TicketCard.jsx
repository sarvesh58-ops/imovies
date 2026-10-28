import React from 'react';

export const TicketCard = ({ booking, onCancel = null, showCancel = false }) => {
  if (!booking) return null;

  const isCancelled = booking.bookingStatus === 'cancelled';
  const showDate = new Date(booking.showtime?.startTime || booking.createdAt);

  return (
    <div className="ticket-wrapper my-3">
      {/* Top Banner / Movie Info */}
      <div className="p-4 bg-dark bg-opacity-75">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <span className="badge bg-danger text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem' }}>
              CINEMA PASS
            </span>
            <h4 className="text-white fw-bold mb-0">{booking.movie?.title}</h4>
          </div>
          <span
            className={`badge px-3 py-1.5 ${
              isCancelled ? 'bg-danger bg-opacity-25 text-danger border border-danger' : 'bg-success bg-opacity-25 text-success border border-success'
            }`}
          >
            {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
          </span>
        </div>

        <div className="small text-secondary d-flex flex-column gap-1">
          <p className="mb-0 text-light">
            <i className="bi bi-geo-alt text-danger me-1"></i>
            {booking.theatre?.name} — {booking.theatre?.city}
          </p>
          <p className="mb-0 extra-small text-secondary" style={{ fontSize: '0.8rem' }}>
            {booking.theatre?.address}
          </p>
        </div>
      </div>

      {/* Perforation Line */}
      <div className="ticket-perforation">
        <div className="dashed-line"></div>
      </div>

      {/* Ticket Details & QR */}
      <div className="p-4 bg-dark bg-opacity-50">
        <div className="row g-3 mb-4">
          <div className="col-6">
            <span className="text-secondary extra-small text-uppercase">Date & Time</span>
            <p className="text-white fw-bold mb-0 small">
              {showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </p>
            <p className="text-secondary extra-small mb-0">
              {showDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({booking.showtime?.format || '2D'})
            </p>
          </div>

          <div className="col-6">
            <span className="text-secondary extra-small text-uppercase">Auditorium</span>
            <p className="text-white fw-bold mb-0 small">{booking.screen?.name || 'Screen 1'}</p>
            <p className="text-secondary extra-small mb-0">{booking.showtime?.language || 'English'}</p>
          </div>

          <div className="col-12">
            <span className="text-secondary extra-small text-uppercase">Booked Seats</span>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {booking.seats?.map((s, idx) => (
                <span key={idx} className="badge bg-secondary bg-opacity-25 border border-secondary text-info px-2.5 py-1">
                  {s.seatCode} ({s.tier})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code and Reference */}
        <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-black border border-secondary border-opacity-50 mb-3">
          <div>
            <span className="text-secondary extra-small text-uppercase">Booking Ref</span>
            <p className="font-monospace text-white fw-bold fs-6 mb-1">{booking.bookingReference}</p>
            <span className="text-success extra-small fw-semibold">
              <i className="bi bi-check-circle-fill me-1"></i> Paid: ${booking.totalAmount?.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-1 rounded-2 shadow-sm" style={{ width: '84px', height: '84px' }}>
            {booking.qrCodeData?.startsWith('data:image') ? (
              <img src={booking.qrCodeData} alt="Ticket QR" className="w-100 h-100 object-fit-contain" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-dark">
                <i className="bi bi-qr-code fs-1"></i>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-cinema-outline w-100 btn-sm d-flex align-items-center justify-content-center gap-1"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer"></i>
            <span>Print Ticket</span>
          </button>

          {showCancel && !isCancelled && onCancel && (
            <button
              type="button"
              className="btn btn-outline-danger w-100 btn-sm d-flex align-items-center justify-content-center gap-1"
              onClick={() => onCancel(booking._id)}
            >
              <i className="bi bi-x-circle"></i>
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
