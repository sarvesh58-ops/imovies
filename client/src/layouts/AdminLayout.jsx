import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100 bg-black">
      {/* Admin Top Header */}
      <header className="navbar navbar-dark bg-dark border-bottom border-secondary px-3 py-2 sticky-top">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <Link to="/admin" className="navbar-brand d-flex align-items-center gap-2 mb-0">
              <span className="badge bg-danger fw-bold">ADMIN</span>
              <span className="fw-bolder fs-5 text-white brand-font">IMOVIES CONSOLE</span>
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                alt="admin avatar"
                className="rounded-circle border border-danger"
                style={{ width: '32px', height: '32px' }}
              />
              <span className="text-white small fw-semibold d-none d-sm-inline">{user?.name}</span>
            </div>
            <Link to="/" className="btn btn-outline-secondary btn-sm" title="Go to customer site">
              <i className="bi bi-eye me-1"></i> Public Site
            </Link>
            <button className="btn btn-danger btn-sm" onClick={logout} title="Sign Out">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="d-flex flex-grow-1">
        <AdminSidebar />
        <main className="flex-grow-1 p-3 p-md-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 58px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
