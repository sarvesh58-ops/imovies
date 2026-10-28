import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg glass-nav sticky-top py-2">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-gradient text-white shadow-sm"
            style={{ width: '38px', height: '38px' }}
          >
            <i className="bi bi-film fs-5"></i>
          </div>
          <span className="fw-bolder fs-4 tracking-tight brand-font text-white">
            I<span className="text-danger">MOVIES</span>
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-secondary text-secondary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <i className="bi bi-list fs-3 text-white"></i>
        </button>

        {/* Nav Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-2">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-white fw-semibold' : 'text-secondary'}`}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/movies" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-white fw-semibold' : 'text-secondary'}`}>
                Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/theatres" className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-white fw-semibold' : 'text-secondary'}`}>
                Theatres
              </NavLink>
            </li>
          </ul>

          {/* Search Bar */}
          <form className="d-flex me-lg-3 my-2 my-lg-0 position-relative" onSubmit={handleSearchSubmit}>
            <input
              className="form-control bg-dark border-secondary text-white ps-4 pe-5 rounded-pill"
              type="search"
              placeholder="Search movies, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '240px', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              className="btn btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-1 p-0 px-2"
            >
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* User Auth Section */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-dark border-secondary bg-transparent d-flex align-items-center gap-2 rounded-pill px-3 py-1 dropdown-toggle text-white"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                    alt="avatar"
                    className="rounded-circle border border-danger"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                  <span className="small fw-semibold">{user?.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-dark border-secondary shadow-lg mt-2 p-2">
                  <li className="px-3 py-1 border-bottom border-secondary mb-1">
                    <p className="mb-0 fw-bold small text-white">{user?.name}</p>
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {user?.role}
                    </span>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger fw-semibold" to="/admin">
                        <i className="bi bi-speedometer2"></i> Admin Portal
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/my-bookings">
                      <i className="bi bi-ticket-perforated"></i> My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/profile">
                      <i className="bi bi-person-gear"></i> Account Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider border-secondary my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
