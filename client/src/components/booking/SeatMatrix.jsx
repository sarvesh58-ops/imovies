import React from 'react';

export const SeatMatrix = ({ seats = [], layoutConfig, selectedSeats = [], onToggleSeat }) => {
  // Group seats by Row letter
  const groupedRows = React.useMemo(() => {
    const rowsMap = {};
    seats.forEach((s) => {
      if (!rowsMap[s.row]) {
        rowsMap[s.row] = [];
      }
      rowsMap[s.row].push(s);
    });

    // Ensure seats in each row are sorted by seat number
    Object.keys(rowsMap).forEach((r) => {
      rowsMap[r].sort((a, b) => a.number - b.number);
    });

    return Object.entries(rowsMap).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const isSeatSelected = (seatId) => selectedSeats.some((s) => s._id === seatId);

  return (
    <div className="seat-matrix-wrapper p-3 p-md-4 rounded-4 glass-panel overflow-x-auto text-center">
      {/* Cinema Screen Curve Graphic */}
      <div className="screen-container">
        <div className="screen-curve"></div>
        <div className="screen-label">
          <i className="bi bi-chevron-down me-1"></i> ALL EYES THIS WAY • SCREEN <i className="bi bi-chevron-down ms-1"></i>
        </div>
      </div>

      {/* Auditorium Seat Grid */}
      <div className="auditorium-grid d-inline-block py-2" style={{ minWidth: '480px' }}>
        {groupedRows.map(([rowLetter, rowSeats]) => (
          <div key={rowLetter} className="seat-row">
            <span className="row-label">{rowLetter}</span>

            {rowSeats.map((seat) => {
              const selected = isSeatSelected(seat._id);
              const isBooked = seat.status === 'booked';
              const isMaintenance = seat.status === 'maintenance';

              // CSS classes
              let tierClass = 'tier-standard';
              if (seat.tier === 'Premium') tierClass = 'tier-premium';
              if (seat.tier === 'VIP') tierClass = 'tier-vip';

              return (
                <button
                  key={seat._id}
                  type="button"
                  className={`seat-btn ${tierClass} ${selected ? 'selected' : ''} ${
                    isBooked ? 'booked' : ''
                  }`}
                  disabled={isBooked || isMaintenance}
                  onClick={() => onToggleSeat(seat)}
                  title={`Seat ${seat.seatCode} (${seat.tier}) — $${seat.price?.toFixed(2)}`}
                >
                  {!isBooked && seat.number}
                </button>
              );
            })}

            <span className="row-label">{rowLetter}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
