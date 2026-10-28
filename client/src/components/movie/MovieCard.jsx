import React from 'react';
import { Link } from 'react-router-dom';

export const MovieCard = ({ movie }) => {
  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="movie-card h-100 d-flex flex-column">
        <Link to={`/movies/${movie.slug || movie._id}`} className="poster-wrapper text-decoration-none">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="poster-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
            }}
          />

          {/* Rating Badge */}
          {movie.ratingAverage > 0 ? (
            <div className="rating-badge">
              <i className="bi bi-star-fill"></i>
              <span>{movie.ratingAverage.toFixed(1)}</span>
            </div>
          ) : (
            <div className="rating-badge text-white">
              <span style={{ fontSize: '0.75rem' }}>NEW</span>
            </div>
          )}

          {/* Certificate Badge */}
          <div className="certificate-badge">{movie.certificate || 'UA'}</div>
        </Link>

        {/* Card Body */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                {movie.languages?.[0] || 'English'}
              </span>
              <span className="text-secondary extra-small" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-clock me-1"></i>
                {movie.durationMinutes}m
              </span>
            </div>

            <h5 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
              <Link to={`/movies/${movie.slug || movie._id}`} className="text-white text-decoration-none hover-text-danger">
                {movie.title}
              </Link>
            </h5>

            <p className="text-secondary small mb-3 text-truncate" style={{ fontSize: '0.8rem' }}>
              {movie.genres?.join(', ')}
            </p>
          </div>

          <div>
            {isComingSoon ? (
              <Link
                to={`/movies/${movie.slug || movie._id}`}
                className="btn btn-secondary bg-opacity-25 border border-secondary text-white w-100 btn-sm fw-semibold"
              >
                <i className="bi bi-info-circle me-1"></i> Details
              </Link>
            ) : (
              <Link
                to={`/movies/${movie.slug || movie._id}`}
                className="btn btn-cinema w-100 btn-sm"
              >
                <i className="bi bi-ticket-perforated me-1"></i> Book Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
