import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-top border-secondary border-opacity-25 bg-dark mt-auto pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 mb-3 text-decoration-none">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-gradient text-white"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-film"></i>
              </div>
              <span className="fw-bolder fs-4 tracking-tight brand-font text-white">
                I<span className="text-danger">MOVIES</span>
              </span>
            </Link>
            <p className="text-secondary small pe-lg-4">
              Your ultimate cinematic experience. Discover the latest blockbuster releases, select your favorite auditorium seats in real-time, and experience seamless ticket booking.
            </p>
            <div className="d-flex gap-3 text-secondary fs-5 mt-3">
              <a href="#instagram" className="text-secondary hover-text-white"><i className="bi bi-instagram"></i></a>
              <a href="#twitter" className="text-secondary hover-text-white"><i className="bi bi-twitter-x"></i></a>
              <a href="#youtube" className="text-secondary hover-text-white"><i className="bi bi-youtube"></i></a>
              <a href="#facebook" className="text-secondary hover-text-white"><i className="bi bi-facebook"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/movies" className="text-secondary text-decoration-none">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-secondary text-decoration-none">Coming Soon</Link></li>
              <li><Link to="/theatres" className="text-secondary text-decoration-none">Find Theatres</Link></li>
              <li><Link to="/my-bookings" className="text-secondary text-decoration-none">My Tickets</Link></li>
            </ul>
          </div>

          {/* Top Cinema Cities */}
          <div className="col-lg-3 col-6">
            <h6 className="text-white fw-bold mb-3">Cinema Locations</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/theatres?city=New%20York" className="text-secondary text-decoration-none">New York City — IMAX Horizon</Link></li>
              <li><Link to="/theatres?city=Los%20Angeles" className="text-secondary text-decoration-none">Los Angeles — Starlight Luxury</Link></li>
              <li><Link to="/theatres?city=Chicago" className="text-secondary text-decoration-none">Chicago — Regal Skyline</Link></li>
            </ul>
          </div>

          {/* Safe & Secure */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Verified Experience</h6>
            <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                <i className="bi bi-shield-check fs-4"></i>
                <span className="fw-semibold text-white small">Instant Atomic Locking</span>
              </div>
              <p className="text-secondary extra-small mb-0" style={{ fontSize: '0.8rem' }}>
                Zero duplicate bookings guaranteed with database-level concurrency protection and scannable QR ticket verification.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 small text-secondary">
          <p className="mb-0">© {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#privacy" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-secondary text-decoration-none">Terms of Service</a>
            <a href="#support" className="text-secondary text-decoration-none">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
