import React, { useState, useEffect } from 'react';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const ShowtimeManagement = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Showtime Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [format, setFormat] = useState('2D');
  const [pricingStandard, setPricingStandard] = useState(12);
  const [pricingPremium, setPricingPremium] = useState(16);
  const [pricingVip, setPricingVip] = useState(22);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        movieService.getMovies({ limit: 50 }),
        theatreService.getTheatres()
      ]);
      setMovies(moviesRes.data || []);
      setTheatres(theatresRes.data || []);

      // If movies exist, pick the first movie to load its showtimes
      if (moviesRes.data?.length > 0) {
        setSelectedMovie(moviesRes.data[0]._id);
        const stRes = await movieService.getMovieShowtimes(moviesRes.data[0]._id);
        // Flatten showtimes
        const allSt = [];
        (stRes.data || []).forEach((group) => {
          group.showtimes.forEach((st) => allSt.push({ ...st, theatreName: group.theatre.name }));
        });
        setShowtimes(allSt);
      }
    } catch (err) {
      console.error('Failed to load showtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMovieSelectChange = async (movieId) => {
    setSelectedMovie(movieId);
    try {
      const stRes = await movieService.getMovieShowtimes(movieId);
      const allSt = [];
      (stRes.data || []).forEach((group) => {
        group.showtimes.forEach((st) => allSt.push({ ...st, theatreName: group.theatre.name }));
      });
      setShowtimes(allSt);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter screens based on selected theatre in the modal
  const activeTheatreObj = theatres.find((t) => t._id === selectedTheatre);
  const availableScreens = activeTheatreObj?.screens || [];

  const openAddModal = () => {
    if (theatres.length > 0) {
      setSelectedTheatre(theatres[0]._id);
      if (theatres[0].screens?.length > 0) {
        setSelectedScreen(theatres[0].screens[0]._id);
      }
    }

    // Default start time: Today at 18:00
    const now = new Date();
    now.setHours(18, 0, 0, 0);
    const end = new Date(now);
    end.setHours(20, 45, 0, 0);

    setStartTime(now.toISOString().slice(0, 16));
    setEndTime(end.toISOString().slice(0, 16));
    setShowModal(true);
  };

  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !selectedTheatre || !selectedScreen) {
      showToast('Please select a movie, theatre, and screen', 'warning');
      return;
    }

    setSaving(true);
    const payload = {
      movie: selectedMovie,
      theatre: selectedTheatre,
      screen: selectedScreen,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      format,
      pricing: {
        standard: Number(pricingStandard),
        premium: Number(pricingPremium),
        vip: Number(pricingVip)
      }
    };

    try {
      await adminService.createShowtime(payload);
      showToast('New screening scheduled successfully!', 'success');
      setShowModal(false);
      await handleMovieSelectChange(selectedMovie);
    } catch (err) {
      showToast(err.message || 'Failed to create showtime', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm('Delete this showtime and release all seat reservations?')) return;
    try {
      await adminService.deleteShowtime(showtimeId);
      showToast('Showtime deleted', 'success');
      await handleMovieSelectChange(selectedMovie);
    } catch (err) {
      showToast(err.message || 'Failed to delete showtime', 'error');
    }
  };

  if (loading) {
    return <Loader message="Loading showtime schedules..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Showtime & Screening Scheduler</h2>
          <p className="text-secondary small mb-0">Create and manage movie schedules across cinema screens</p>
        </div>
        <button className="btn btn-cinema btn-sm" onClick={openAddModal}>
          <i className="bi bi-calendar-plus me-1"></i> Schedule Showtime
        </button>
      </div>

      {/* Filter by Movie Dropdown */}
      <div className="card glass-panel border-secondary p-3 mb-4">
        <div className="row align-items-center g-2">
          <div className="col-md-3">
            <span className="text-secondary small fw-semibold">Filter Showtimes by Movie:</span>
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-white"
              value={selectedMovie}
              onChange={(e) => handleMovieSelectChange(e.target.value)}
            >
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-md-end">
            <span className="badge bg-secondary bg-opacity-25 text-info border border-secondary">
              {showtimes.length} Screenings
            </span>
          </div>
        </div>
      </div>

      {/* Showtimes Table */}
      <div className="card glass-panel border-secondary p-4">
        {showtimes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
            <h6 className="text-white fw-bold">No Showtimes for this Movie</h6>
            <p className="text-secondary small mb-3">Schedule a new screening for this title</p>
            <button className="btn btn-cinema btn-sm" onClick={openAddModal}>
              Schedule Screening
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary extra-small text-uppercase">
                  <th>Theatre</th>
                  <th>Auditorium</th>
                  <th>Date & Time</th>
                  <th>Format</th>
                  <th>Pricing (Std/Prem/VIP)</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <span className="text-white fw-semibold">{st.theatreName || st.theatre?.name}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{st.screen?.name}</span>
                    </td>
                    <td>
                      <div className="text-white fw-bold">
                        {new Date(st.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </div>
                      <span className="text-secondary extra-small">
                        {new Date(st.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(st.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                        {st.format}
                      </span>
                    </td>
                    <td>
                      <span className="font-monospace text-light">
                        ${st.pricing?.standard} / ${st.pricing?.premium} / ${st.pricing?.vip}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-25 text-success border border-success">
                        {st.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-dark border-secondary btn-sm text-danger"
                        onClick={() => handleDeleteShowtime(st._id)}
                        title="Delete Showtime"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Showtime Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary rounded-4 p-4">
              <div className="modal-header border-secondary border-opacity-50 pb-3">
                <h5 className="modal-title text-white fw-bold">Schedule New Screening</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateShowtime} className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Movie</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary text-white"
                    value={selectedMovie}
                    onChange={(e) => setSelectedMovie(e.target.value)}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Theatre</label>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={selectedTheatre}
                      onChange={(e) => {
                        setSelectedTheatre(e.target.value);
                        const t = theatres.find((x) => x._id === e.target.value);
                        if (t?.screens?.length > 0) setSelectedScreen(t.screens[0]._id);
                      }}
                      required
                    >
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Screen</label>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={selectedScreen}
                      onChange={(e) => setSelectedScreen(e.target.value)}
                      required
                    >
                      {availableScreens.map((s) => (
                        <option key={s._id} value={s._id}>{s.name} ({s.screenType})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Start Time</label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">End Time</label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Format</label>
                  <select
                    className="form-select form-select-sm bg-black border-secondary text-white"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="2D">2D Standard</option>
                    <option value="3D">3D RealD</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX Motion</option>
                  </select>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-4">
                    <label className="form-label text-secondary extra-small fw-semibold">Standard ($)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={pricingStandard}
                      onChange={(e) => setPricingStandard(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-secondary extra-small fw-semibold">Premium ($)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={pricingPremium}
                      onChange={(e) => setPricingPremium(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-secondary extra-small fw-semibold">VIP ($)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={pricingVip}
                      onChange={(e) => setPricingVip(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-50 pt-3">
                  <button
                    type="button"
                    className="btn btn-dark border-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema btn-sm"
                    disabled={saving}
                  >
                    {saving ? 'Scheduling...' : 'Save Showtime'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
