import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { TicketCard } from '../../components/booking/TicketCard';
import { Loader } from '../../components/common/Loader';

export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings({
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        limit: 50
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBookings();
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Platform Bookings</h2>
          <p className="text-secondary small mb-0">Search and monitor all cinema reservations and digital passes</p>
        </div>
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-info px-3 py-2">
          {bookings.length} Bookings
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass-panel border-secondary p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white"
                placeholder="Search by Reference Code (e.g. IMV-...) or Transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-cinema" type="submit">Search</button>
            </div>
          </div>

          <div className="col-md-6 d-flex justify-content-md-end gap-2">
            {['all', 'confirmed', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm text-capitalize ${
                  status === st ? 'btn-danger' : 'btn-dark border-secondary text-secondary'
                }`}
                onClick={() => setStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="card glass-panel border-secondary p-4">
        {loading ? (
          <Loader message="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary mb-0">No bookings match your criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary extra-small text-uppercase">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie & Screening</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="text-end">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="font-monospace text-info fw-bold d-block">{b.bookingReference}</span>
                      <span className="extra-small text-secondary">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span className="text-white fw-bold d-block">{b.user?.name}</span>
                      <span className="text-secondary extra-small">{b.user?.email}</span>
                    </td>
                    <td>
                      <span className="text-white fw-semibold d-block">{b.movie?.title}</span>
                      <span className="text-secondary extra-small">
                        {b.theatre?.name} • {b.screen?.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-light">
                        {b.seats?.map((s) => s.seatCode).join(', ')}
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
                    <td className="text-white fw-bold">${b.totalAmount?.toFixed(2)}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-dark border-secondary btn-sm text-info"
                        onClick={() => setSelectedTicket(b)}
                        title="View Digital Ticket Pass"
                      >
                        <i className="bi bi-qr-code me-1"></i> Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setSelectedTicket(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="text-end mb-2">
                <button
                  type="button"
                  className="btn btn-dark border-secondary rounded-circle btn-sm text-white"
                  onClick={() => setSelectedTicket(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <TicketCard booking={selectedTicket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
