import React, { useState, useEffect } from 'react';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const TheatreManagement = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theatre Modal
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'New York',
    address: '',
    contactPhone: '',
    amenities: 'IMAX Laser, Dolby Atmos, Recliners, Cafe'
  });

  // Screen Modal
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [selectedTheatreForScreen, setSelectedTheatreForScreen] = useState(null);
  const [screenForm, setScreenForm] = useState({
    name: 'Screen 1 (IMAX)',
    screenType: 'IMAX',
    soundSystem: 'Dolby Atmos 12-Channel',
    rowsCount: 8,
    columnsCount: 12
  });

  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadTheatres = async () => {
    try {
      const res = await theatreService.getTheatres();
      setTheatres(res.data || []);
    } catch (err) {
      console.error('Failed to load theatres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const openAddTheatreModal = () => {
    setEditingTheatre(null);
    setTheatreForm({
      name: '',
      city: 'New York',
      address: '',
      contactPhone: '',
      amenities: 'IMAX Laser, Dolby Atmos, Recliners, Cafe'
    });
    setShowTheatreModal(true);
  };

  const openEditTheatreModal = (theatre) => {
    setEditingTheatre(theatre);
    setTheatreForm({
      name: theatre.name,
      city: theatre.city,
      address: theatre.address,
      contactPhone: theatre.contactPhone || '',
      amenities: theatre.amenities?.join(', ') || ''
    });
    setShowTheatreModal(true);
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...theatreForm,
      amenities: theatreForm.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    };

    try {
      if (editingTheatre) {
        await adminService.updateTheatre(editingTheatre._id, payload);
        showToast('Theatre updated successfully!', 'success');
      } else {
        await adminService.createTheatre(payload);
        showToast('New theatre created!', 'success');
      }
      setShowTheatreModal(false);
      await loadTheatres();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAddScreenModal = (theatre) => {
    setSelectedTheatreForScreen(theatre);
    setScreenForm({
      name: `Screen ${(theatre.screens?.length || 0) + 1} (${theatre.name.includes('IMAX') ? 'IMAX' : 'Dolby Atmos'})`,
      screenType: theatre.name.includes('IMAX') ? 'IMAX' : '2D',
      soundSystem: 'Dolby Atmos 7.1',
      rowsCount: 8,
      columnsCount: 12
    });
    setShowScreenModal(true);
  };

  const handleScreenSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const allRowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const rows = allRowLetters.slice(0, Math.min(12, Math.max(4, Number(screenForm.rowsCount))));
    const columns = Math.min(16, Math.max(6, Number(screenForm.columnsCount)));

    const payload = {
      name: screenForm.name,
      screenType: screenForm.screenType,
      soundSystem: screenForm.soundSystem,
      rows,
      columns
    };

    try {
      await adminService.addScreen(selectedTheatreForScreen._id, payload);
      showToast('Screen and seats generated successfully!', 'success');
      setShowScreenModal(false);
      await loadTheatres();
    } catch (err) {
      showToast(err.message || 'Failed to create screen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (theatreId) => {
    if (!window.confirm('Are you sure you want to delete this theatre? All associated screens and showtimes will be removed.')) {
      return;
    }
    try {
      await adminService.deleteTheatre(theatreId);
      showToast('Theatre removed', 'success');
      await loadTheatres();
    } catch (err) {
      showToast(err.message || 'Failed to delete theatre', 'error');
    }
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('Delete this screen and all its seats?')) return;
    try {
      await adminService.deleteScreen(screenId);
      showToast('Screen removed', 'success');
      await loadTheatres();
    } catch (err) {
      showToast(err.message || 'Failed to delete screen', 'error');
    }
  };

  if (loading) {
    return <Loader message="Loading theatres and screens..." />;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Theatres & Screens Management</h2>
          <p className="text-secondary small mb-0">Configure multiplex locations, screens, and seat matrices</p>
        </div>
        <button className="btn btn-cinema btn-sm" onClick={openAddTheatreModal}>
          <i className="bi bi-plus-lg me-1"></i> Add New Theatre
        </button>
      </div>

      <div className="row g-4">
        {theatres.map((theatre) => (
          <div key={theatre._id} className="col-lg-6">
            <div className="card glass-panel border-secondary p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h4 className="text-white fw-bold mb-0">{theatre.name}</h4>
                    <span className="text-secondary extra-small">
                      <i className="bi bi-geo-alt text-danger me-1"></i>
                      {theatre.address} ({theatre.city})
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-dark border-secondary btn-sm text-info"
                      onClick={() => openEditTheatreModal(theatre)}
                      title="Edit Theatre"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark border-secondary btn-sm text-danger"
                      onClick={() => handleDeleteTheatre(theatre._id)}
                      title="Delete Theatre"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Screens List */}
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-50">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-secondary extra-small text-uppercase fw-semibold">
                      Screens ({theatre.screens?.length || 0})
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm extra-small py-1 px-2"
                      onClick={() => openAddScreenModal(theatre)}
                    >
                      <i className="bi bi-plus me-1"></i> Add Screen
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {theatre.screens?.map((scr) => (
                      <div
                        key={scr._id}
                        className="p-2 px-3 rounded-2 bg-dark border border-secondary d-flex align-items-center justify-content-between"
                      >
                        <div>
                          <span className="text-white fw-bold small d-block">{scr.name}</span>
                          <span className="text-secondary extra-small">
                            {scr.screenType} • {scr.soundSystem} • {scr.totalSeats} Total Seats
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleDeleteScreen(scr._id)}
                          title="Delete Screen"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Theatre Modal */}
      {showTheatreModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setShowTheatreModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary rounded-4 p-4">
              <div className="modal-header border-secondary border-opacity-50 pb-3">
                <h5 className="modal-title text-white fw-bold">
                  {editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTheatreModal(false)}
                ></button>
              </div>

              <form onSubmit={handleTheatreSubmit} className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Theatre Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    placeholder="e.g. IMAX Horizon Cineplex"
                    value={theatreForm.name}
                    onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">City</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    placeholder="e.g. New York"
                    value={theatreForm.city}
                    onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Address</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    placeholder="Full street address"
                    value={theatreForm.address}
                    onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Contact Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    placeholder="+1 (555) 000-0000"
                    value={theatreForm.contactPhone}
                    onChange={(e) => setTheatreForm({ ...theatreForm, contactPhone: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary small fw-semibold">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    value={theatreForm.amenities}
                    onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value })}
                  />
                </div>

                <div className="modal-footer border-secondary border-opacity-50 pt-3">
                  <button
                    type="button"
                    className="btn btn-dark border-secondary btn-sm"
                    onClick={() => setShowTheatreModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema btn-sm"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingTheatre ? 'Update Theatre' : 'Create Theatre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showScreenModal && selectedTheatreForScreen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setShowScreenModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary rounded-4 p-4">
              <div className="modal-header border-secondary border-opacity-50 pb-3">
                <h5 className="modal-title text-white fw-bold">
                  Add Screen to {selectedTheatreForScreen.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowScreenModal(false)}
                ></button>
              </div>

              <form onSubmit={handleScreenSubmit} className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Screen Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    value={screenForm.name}
                    onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Format</label>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={screenForm.screenType}
                      onChange={(e) => setScreenForm({ ...screenForm, screenType: e.target.value })}
                    >
                      <option value="2D">2D Standard</option>
                      <option value="3D">3D RealD</option>
                      <option value="IMAX">IMAX Laser</option>
                      <option value="4DX">4DX Motion</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Audio System</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={screenForm.soundSystem}
                      onChange={(e) => setScreenForm({ ...screenForm, soundSystem: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Auditorium Rows (A-L)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      min="4"
                      max="12"
                      value={screenForm.rowsCount}
                      onChange={(e) => setScreenForm({ ...screenForm, rowsCount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">Seats Per Row</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      min="6"
                      max="16"
                      value={screenForm.columnsCount}
                      onChange={(e) => setScreenForm({ ...screenForm, columnsCount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-black border border-secondary text-center mb-4">
                  <span className="text-info extra-small">
                    Auto-Seat Generator will create{' '}
                    <strong>{screenForm.rowsCount * screenForm.columnsCount}</strong> individual seats across Standard, Premium, and VIP tiers.
                  </span>
                </div>

                <div className="modal-footer border-secondary border-opacity-50 pt-3">
                  <button
                    type="button"
                    className="btn btn-dark border-secondary btn-sm"
                    onClick={() => setShowScreenModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema btn-sm"
                    disabled={saving}
                  >
                    {saving ? 'Generating Seat Matrix...' : 'Generate Screen & Seats'}
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
