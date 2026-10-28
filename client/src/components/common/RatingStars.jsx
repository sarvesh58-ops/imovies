import React from 'react';

export const RatingStars = ({ rating = 0, count = null, max = 10 }) => {
  // Normalize 10-point rating to 5 stars for visual display
  const stars5 = (rating / max) * 5;
  const fullStars = Math.floor(stars5);
  const hasHalfStar = stars5 - fullStars >= 0.5;

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="text-warning d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <i key={i} className="bi bi-star-fill me-0.5"></i>;
          }
          if (i === fullStars && hasHalfStar) {
            return <i key={i} className="bi bi-star-half me-0.5"></i>;
          }
          return <i key={i} className="bi bi-star me-0.5 text-secondary opacity-50"></i>;
        })}
      </div>
      <span className="fw-bold text-white small ms-1">{rating ? rating.toFixed(1) : 'NR'}</span>
      <span className="text-secondary extra-small" style={{ fontSize: '0.75rem' }}>/{max}</span>
      {count !== null && (
        <span className="text-secondary ms-1 extra-small" style={{ fontSize: '0.75rem' }}>
          ({count} reviews)
        </span>
      )}
    </div>
  );
};
