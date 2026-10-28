import React from 'react';

export const TrailerModal = ({ movie, onClose }) => {
  if (!movie || !movie.trailerUrl) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark border-secondary shadow-2xl rounded-4 overflow-hidden">
          <div className="modal-header border-secondary border-opacity-50 py-3 px-4">
            <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-play-circle-fill text-danger"></i>
              {movie.title} — Official Trailer
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-0 ratio ratio-16x9 bg-black">
            <iframe
              src={`${movie.trailerUrl}?autoplay=1`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
