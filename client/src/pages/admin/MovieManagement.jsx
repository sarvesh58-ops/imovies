import React, { useState, useEffect } from 'react';
import { movieService } from '../../services/movieService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState(null);
  const [saving, setSaving] = useState(false);

  // TMDB Import Modal State
  const [tmdbModalOpen, setTmdbModalOpen] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [tmdbImportingId, setTmdbImportingId] = useState(null);
  const [tmdbNotice, setTmdbNotice] = useState('');

  const { showToast } = useToast();

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 120,
    releaseDate: new Date().toISOString().slice(0, 10),
    genres: 'Action, Sci-Fi',
    languages: 'English',
    certificate: 'UA',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    director: '',
    status: 'now_showing'
  });

  const loadMovies = async () => {
    try {
      const res = await movieService.getMovies({ limit: 50 });
      setMovies(res.data || []);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      durationMinutes: 120,
      releaseDate: new Date().toISOString().slice(0, 10),
      genres: 'Action, Sci-Fi',
      languages: 'English',
      certificate: 'UA',
      posterUrl: '',
      bannerUrl: '',
      trailerUrl: '',
      director: '',
      status: 'now_showing'
    });
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      releaseDate: new Date(movie.releaseDate).toISOString().slice(0, 10),
      genres: movie.genres?.join(', ') || '',
      languages: movie.languages?.join(', ') || '',
      certificate: movie.certificate || 'UA',
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl || '',
      director: movie.director || '',
      status: movie.status || 'now_showing'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      durationMinutes: Number(formData.durationMinutes),
      genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
      languages: formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
    };

    try {
      if (editingMovie) {
        await adminService.updateMovie(editingMovie._id, payload);
        showToast('Movie updated successfully!', 'success');
      } else {
        await adminService.createMovie(payload);
        showToast('New movie added to catalog!', 'success');
      }
      setShowModal(false);
      await loadMovies();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmMovie) return;
    try {
      await adminService.deleteMovie(deleteConfirmMovie._id);
      showToast('Movie deleted successfully', 'success');
      setDeleteConfirmMovie(null);
      await loadMovies();
    } catch (err) {
      showToast(err.message || 'Failed to delete movie', 'error');
    }
  };

  // TMDB Handlers
  const handleOpenTmdbModal = async () => {
    setTmdbModalOpen(true);
    setTmdbQuery('');
    setTmdbNotice('');
    // Load trending by default
    setTmdbSearching(true);
    try {
      const res = await movieService.getTrendingTmdb();
      setTmdbResults(res.data?.results || []);
      if (res.data?.notice) setTmdbNotice(res.data.notice);
    } catch (err) {
      console.error('TMDB trending load error:', err);
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleSearchTmdb = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await movieService.searchTmdb(tmdbQuery.trim());
      setTmdbResults(res.data?.results || []);
      if (res.data?.notice) setTmdbNotice(res.data.notice);
    } catch (err) {
      showToast(err.message || 'TMDB search failed', 'error');
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleImportTmdbMovie = async (tmdbId) => {
    setTmdbImportingId(tmdbId);
    try {
      await movieService.importFromTmdb(tmdbId, { status: 'now_showing' });
      showToast('Movie imported from TMDB successfully!', 'success');
      await loadMovies();
      setTmdbModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to import movie from TMDB', 'error');
    } finally {
      setTmdbImportingId(null);
    }
  };

  if (loading) {
    return <Loader message="Loading movie catalogue..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Movie Catalogue Management</h2>
          <p className="text-secondary small mb-0">Add, edit, or archive movies shown across all cinemas</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm d-flex align-items-center gap-1" onClick={handleOpenTmdbModal}>
            <i className="bi bi-cloud-arrow-down-fill"></i> Import from TMDB
          </button>
          <button className="btn btn-cinema btn-sm d-flex align-items-center gap-1" onClick={openAddModal}>
            <i className="bi bi-plus-lg"></i> Add New Movie
          </button>
        </div>
      </div>

      <div className="card glass-panel border-secondary p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0 small">
            <thead>
              <tr className="text-secondary extra-small text-uppercase">
                <th>Movie</th>
                <th>Certificate</th>
                <th>Duration</th>
                <th>Genres</th>
                <th>Status</th>
                <th>Rating</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={movie.posterUrl}
                        alt=""
                        className="rounded"
                        style={{ width: '36px', height: '48px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                      <div>
                        <span className="text-white fw-bold d-block">{movie.title}</span>
                        <span className="text-secondary extra-small">{movie.director || 'Director TBA'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-dark border border-secondary">{movie.certificate}</span>
                  </td>
                  <td>{movie.durationMinutes}m</td>
                  <td>
                    <span className="text-secondary extra-small">{movie.genres?.join(', ')}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        movie.status === 'now_showing'
                          ? 'bg-success bg-opacity-25 text-success border border-success'
                          : movie.status === 'coming_soon'
                          ? 'bg-warning bg-opacity-25 text-warning border border-warning'
                          : 'bg-secondary bg-opacity-25 text-secondary border border-secondary'
                      }`}
                    >
                      {movie.status === 'now_showing' ? 'Now Showing' : movie.status === 'coming_soon' ? 'Coming Soon' : 'Archived'}
                    </span>
                  </td>
                  <td>
                    <span className="text-warning fw-bold">
                      ★ {movie.ratingAverage > 0 ? movie.ratingAverage.toFixed(1) : 'NR'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-dark border-secondary btn-sm me-2 text-info"
                      onClick={() => openEditModal(movie)}
                      title="Edit Movie"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark border-secondary btn-sm text-danger"
                      onClick={() => setDeleteConfirmMovie(movie)}
                      title="Delete Movie"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TMDB Integration Modal */}
      {tmdbModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1055 }}
          onClick={() => setTmdbModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary shadow-2xl rounded-4 p-4">
              <div className="modal-header border-secondary border-opacity-50 pb-3">
                <div>
                  <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-film text-info"></i> Search & Import from The Movie Database (TMDB)
                  </h5>
                  <p className="text-secondary extra-small mb-0">
                    Fetch official titles, posters, backdrops, cast, genres, and trailers with 1 click
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setTmdbModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body py-3">
                {/* Search Form */}
                <form onSubmit={handleSearchTmdb} className="mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-black border-secondary text-white"
                      placeholder="Search TMDB by movie title (e.g. Inception, Avatar, Gladiator II)..."
                      value={tmdbQuery}
                      onChange={(e) => setTmdbQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-info px-4 fw-semibold" disabled={tmdbSearching}>
                      {tmdbSearching ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <i className="bi bi-search me-1"></i> Search TMDB
                        </>
                      )}
                    </button>
                  </div>
                  {tmdbNotice && (
                    <div className="text-info extra-small mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      {tmdbNotice}
                    </div>
                  )}
                </form>

                {/* TMDB Results Grid */}
                {tmdbSearching ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-info mb-2"></span>
                    <p className="text-secondary small">Querying TMDB API...</p>
                  </div>
                ) : tmdbResults.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-film fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                    <p className="text-secondary mb-0">No movies found. Try searching another title.</p>
                  </div>
                ) : (
                  <div className="row g-3" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                    {tmdbResults.map((m) => (
                      <div key={m.tmdbId} className="col-md-6 col-lg-4">
                        <div className="card bg-black border-secondary p-3 h-100 d-flex flex-column justify-content-between">
                          <div className="d-flex gap-3 mb-2">
                            <img
                              src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="rounded"
                              style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                            />
                            <div className="overflow-hidden">
                              <h6 className="text-white fw-bold mb-1 text-truncate" title={m.title}>
                                {m.title}
                              </h6>
                              <div className="d-flex align-items-center gap-2 text-secondary extra-small mb-1">
                                <span>{m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'TBA'}</span>
                                <span className="text-warning">★ {m.ratingAverage}</span>
                              </div>
                              <p className="text-secondary extra-small mb-0 line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {m.description}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-cinema-outline btn-sm w-100 mt-2"
                            disabled={tmdbImportingId === m.tmdbId}
                            onClick={() => handleImportTmdbMovie(m.tmdbId)}
                          >
                            {tmdbImportingId === m.tmdbId ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span> Importing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-box-arrow-in-down me-1"></i> Import to Catalogue
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer border-secondary border-opacity-50 pt-3">
                <button type="button" className="btn btn-dark border-secondary btn-sm" onClick={() => setTmdbModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary shadow-2xl rounded-4 p-4">
              <div className="modal-header border-secondary border-opacity-50 pb-3">
                <h5 className="modal-title text-white fw-bold">
                  {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body py-3">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label text-secondary small fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Status</label>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="coming_soon">Coming Soon</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">Description</label>
                    <textarea
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Release Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Certificate</label>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={formData.certificate}
                      onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                    >
                      <option value="U">U (Universal)</option>
                      <option value="UA">UA (Parental Guidance)</option>
                      <option value="A">A (Adults Only)</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Genres (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      placeholder="Action, Sci-Fi, Adventure"
                      value={formData.genres}
                      onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Languages (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      placeholder="English, Spanish"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Poster URL</label>
                    <input
                      type="url"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Banner Backdrop URL</label>
                    <input
                      type="url"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.bannerUrl}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">YouTube Trailer Embed URL</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      placeholder="https://www.youtube.com/embed/..."
                      value={formData.trailerUrl}
                      onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Director</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-50 pt-3 mt-4">
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
                    {saving ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMovie && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
          onClick={() => setDeleteConfirmMovie(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary shadow-lg rounded-4 p-4 text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-25 text-danger mb-3">
                <i className="bi bi-trash fs-2"></i>
              </div>
              <h5 className="text-white fw-bold mb-1">Delete Movie?</h5>
              <p className="text-secondary small mb-4">
                Are you sure you want to delete <span className="text-white fw-bold">{deleteConfirmMovie.title}</span>? This will also remove any upcoming showtimes.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-dark border-secondary btn-sm px-4"
                  onClick={() => setDeleteConfirmMovie(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
