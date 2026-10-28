import React from 'react';

export const SeatLegend = ({ pricing }) => {
  return (
    <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap my-4 p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 small">
      {/* Available Categories */}
      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn tier-standard" style={{ width: '22px', height: '22px', cursor: 'default' }}></span>
        <span className="text-secondary">Standard (${pricing?.standard?.toFixed(2) || '12.00'})</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn tier-premium" style={{ width: '22px', height: '22px', cursor: 'default' }}></span>
        <span className="text-secondary">Premium (${pricing?.premium?.toFixed(2) || '16.00'})</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn tier-vip" style={{ width: '22px', height: '22px', cursor: 'default' }}></span>
        <span className="text-secondary">VIP Recliner (${pricing?.vip?.toFixed(2) || '22.00'})</span>
      </div>

      {/* States */}
      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn selected" style={{ width: '22px', height: '22px', cursor: 'default' }}></span>
        <span className="text-info fw-semibold">Selected</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn booked" style={{ width: '22px', height: '22px', cursor: 'default' }}></span>
        <span className="text-secondary opacity-75">Sold Out</span>
      </div>
    </div>
  );
};
