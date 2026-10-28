import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export const AdminSidebar = () => {
  const links = [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
    { to: '/admin/movies', icon: 'bi-film', label: 'Movies' },
    { to: '/admin/theatres', icon: 'bi-building', label: 'Theatres & Screens' },
    { to: '/admin/showtimes', icon: 'bi-clock-history', label: 'Showtimes' },
    { to: '/admin/bookings', icon: 'bi-ticket-perforated', label: 'Bookings' },
    { to: '/admin/users', icon: 'bi-people', label: 'Users' },
    { to: '/admin/reviews', icon: 'bi-chat-square-quote', label: 'Reviews' }
  ];

  return (
    <aside className="admin-sidebar d-none d-lg-block py-3">
      <div className="px-3 mb-3 text-secondary extra-small text-uppercase fw-bold" style={{ letterSpacing: '0.1em' }}>
        Admin Management
      </div>
      <nav className="nav flex-column">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <hr className="border-secondary border-opacity-25 my-4 mx-3" />

      <div className="px-3">
        <Link to="/" className="btn btn-dark border-secondary w-100 btn-sm text-secondary hover-text-white d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-box-arrow-up-right"></i>
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
};
