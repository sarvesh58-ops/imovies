import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const HeroSlider = ({ movies = [], onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;
  const currentMovie = movies[currentIndex];

  return (
    <div className="position-relative mb-5">
      <div
        className="hero-banner shadow-2xl"
        style={{
          backgroundImage: `url(${currentMovie.bannerUrl || currentMovie.posterUrl})`,
          transition: 'background-image 0.6s ease-in-out'
        }}
      >
        <div className="hero-content">
          <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span className="badge bg-danger text-uppercase fw-bold px-3 py-1.5" style={{ letterSpacing: '0.05em' }}>
              FEATURED
            </span>
            <span className="badge bg-dark bg-opacity-75 text-warning border border-warning border-opacity-50 px-2.5 py-1">
              <i className="bi bi-star-fill me-1"></i>
              {currentMovie.ratingAverage > 0 ? currentMovie.ratingAverage.toFixed(1) : '9.2'} / 10
            </span>
            <span className="badge bg-dark bg-opacity-75 text-secondary border border-secondary px-2.5 py-1">
              {currentMovie.certificate || 'UA'}
            </span>
            <span className="text-white small fw-semibold">
              <i className="bi bi-clock me-1 text-danger"></i>
              {currentMovie.durationMinutes} mins
            </span>
          </div>

          <h1 className="display-4 fw-bolder text-white mb-2 tracking-tight">
            {currentMovie.title}
          </h1>

          <p className="text-secondary mb-3 small d-flex gap-2 flex-wrap">
            {currentMovie.genres?.map((g) => (
              <span key={g} className="text-light opacity-75">#{g}</span>
            ))}
          </p>

          <p className="text-light opacity-85 mb-4 line-clamp-3 small" style={{ maxWidth: '580px', lineHeight: 1.6 }}>
            {currentMovie.description}
          </p>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <Link
              to={`/movies/${currentMovie.slug || currentMovie._id}`}
              className="btn btn-cinema px-4 py-2"
            >
              <i className="bi bi-ticket-perforated-fill me-2"></i> Book Tickets
            </Link>
            {currentMovie.trailerUrl && (
              <button
                type="button"
                className="btn btn-cinema-outline px-4 py-2 d-flex align-items-center gap-2"
                onClick={() => onWatchTrailer(currentMovie)}
              >
                <i className="bi bi-play-circle-fill fs-5 text-danger"></i>
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slider Indicators */}
      {movies.length > 1 && (
        <div className="d-flex justify-content-center gap-2 position-absolute bottom-0 start-50 translate-middle-x mb-3" style={{ zIndex: 10 }}>
          {movies.map((m, idx) => (
            <button
              key={m._id}
              className={`rounded-pill border-0 transition-all ${
                idx === currentIndex ? 'bg-danger' : 'bg-secondary opacity-50'
              }`}
              style={{
                width: idx === currentIndex ? '28px' : '10px',
                height: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};
