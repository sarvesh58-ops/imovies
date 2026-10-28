import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatWidget } from '../../components/admin/StatWidget';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [theatrePerformance, setTheatrePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, popularRes, perfRes] = await Promise.all([
          adminService.getStats(),
          adminService.getPopularMovies(),
          adminService.getTheatrePerformance()
        ]);

        setStats(statsRes.data);
        setPopularMovies(popularRes.data || []);
        setTheatrePerformance(perfRes.data || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <Loader message="Aggregating platform revenue and statistics..." />;
  }

  const kpis = stats?.kpis || {};
  const recentBookings = stats?.recentBookings || [];

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Executive Dashboard</h2>
          <p className="text-secondary small mb-0">Real-time cinema performance and booking analytics</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-cinema btn-sm">
            <i className="bi bi-plus-lg me-1"></i> Add Movie
          </Link>
          <Link to="/admin/showtimes" className="btn btn-dark border-secondary btn-sm">
            <i className="bi bi-calendar-plus me-1"></i> New Showtime
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-sm-6">
          <StatWidget
            title="Total Revenue"
            value={`$${kpis.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
            icon="bi-cash-coin"
            color="success"
            subtitle={`${kpis.totalSeatsSold || 0} tickets sold`}
          />
        </div>
        <div className="col-xl-3 col-sm-6">
          <StatWidget
            title="Active Bookings"
            value={kpis.totalBookings || 0}
            icon="bi-ticket-detailed"
            color="danger"
            subtitle="Confirmed reservations"
          />
        </div>
        <div className="col-xl-3 col-sm-6">
          <StatWidget
            title="Movies & Theatres"
            value={`${kpis.totalMovies || 0} / ${kpis.totalTheatres || 0}`}
            icon="bi-film"
            color="warning"
            subtitle={`${kpis.activeShowtimes || 0} active screenings`}
          />
        </div>
        <div className="col-xl-3 col-sm-6">
          <StatWidget
            title="Registered Users"
            value={kpis.totalUsers || 0}
            icon="bi-people"
            color="info"
            subtitle="Platform audience"
          />
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="row g-4 mb-4">
        {/* Top Performing Movies */}
        <div className="col-lg-6">
          <div className="card glass-panel border-secondary p-4 h-100">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-danger"></i> Popular Movies by Box Office
            </h5>
            {popularMovies.length === 0 ? (
              <p className="text-secondary small mb-0">No booking data yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary extra-small text-uppercase">
                      <th>Movie</th>
                      <th>Tickets</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularMovies.map((pm) => (
                      <tr key={pm._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={pm.posterUrl}
                              alt=""
                              className="rounded"
                              style={{ width: '28px', height: '38px', objectFit: 'cover' }}
                            />
                            <span className="text-white fw-bold text-truncate" style={{ maxWidth: '180px' }}>
                              {pm.title}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-25 text-info">
                            {pm.seatsSold} seats
                          </span>
                        </td>
                        <td className="text-end text-success fw-bold">
                          ${pm.totalRevenue?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Theatre Performance */}
        <div className="col-lg-6">
          <div className="card glass-panel border-secondary p-4 h-100">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-building-check text-warning"></i> Multiplex Box Office Performance
            </h5>
            {theatrePerformance.length === 0 ? (
              <p className="text-secondary small mb-0">No theatre booking data yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary extra-small text-uppercase">
                      <th>Theatre & Location</th>
                      <th>Tickets</th>
                      <th className="text-end">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theatrePerformance.map((tp) => (
                      <tr key={tp._id}>
                        <td>
                          <div className="text-white fw-bold">{tp.name}</div>
                          <span className="text-secondary extra-small">{tp.city}</span>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-light">
                            {tp.seatsSold} seats
                          </span>
                        </td>
                        <td className="text-end text-success fw-bold">
                          ${tp.totalRevenue?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Activity */}
      <div className="card glass-panel border-secondary p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-danger"></i> Recent Customer Bookings
          </h5>
          <Link to="/admin/bookings" className="btn btn-cinema-outline btn-sm">
            View All Bookings <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-secondary small mb-0">No recent bookings recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary extra-small text-uppercase">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="font-monospace text-info fw-bold">{b.bookingReference}</td>
                    <td>
                      <div className="text-white fw-semibold">{b.user?.name}</div>
                      <span className="text-secondary extra-small">{b.user?.email}</span>
                    </td>
                    <td className="text-white">{b.movie?.title}</td>
                    <td className="text-secondary">{b.theatre?.name}</td>
                    <td>
                      <span className="badge bg-dark border border-secondary">
                        {b.seats?.length} seats
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-success bg-opacity-25 text-success border border-success'
                            : 'bg-danger bg-opacity-25 text-danger border border-danger'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end text-white fw-bold">
                      ${b.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
