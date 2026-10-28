import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

export const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReviews({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50
      });
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await adminService.updateReviewStatus(reviewId, newStatus);
      showToast(`Review marked as ${newStatus}`, 'info');
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update review status', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold brand-font mb-1">Movie Reviews Moderation</h2>
          <p className="text-secondary small mb-0">Approve, flag, or hide user feedback to ensure quality ratings</p>
        </div>

        {/* Status Pills */}
        <div className="d-flex gap-2">
          {['all', 'approved', 'flagged', 'hidden'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm text-capitalize ${
                statusFilter === st ? 'btn-danger' : 'btn-dark border-secondary text-secondary'
              }`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="card glass-panel border-secondary p-4">
        {loading ? (
          <Loader message="Loading customer reviews..." />
        ) : reviews.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary mb-0">No reviews found under this filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary extra-small text-uppercase">
                  <th>Movie</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Moderation Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={rev.movie?.posterUrl}
                          alt=""
                          className="rounded"
                          style={{ width: '28px', height: '38px', objectFit: 'cover' }}
                        />
                        <span className="text-white fw-bold">{rev.movie?.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-white fw-semibold">{rev.user?.name}</div>
                      <span className="text-secondary extra-small">{rev.user?.email}</span>
                    </td>
                    <td>
                      <span className="badge bg-warning bg-opacity-25 text-warning border border-warning">
                        ★ {rev.rating}/10
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {rev.title && <div className="text-white fw-bold extra-small">{rev.title}</div>}
                      <p className="text-secondary extra-small mb-0 text-truncate" title={rev.comment}>
                        {rev.comment}
                      </p>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rev.status === 'approved'
                            ? 'bg-success bg-opacity-25 text-success border border-success'
                            : rev.status === 'flagged'
                            ? 'bg-warning bg-opacity-25 text-warning border border-warning'
                            : 'bg-secondary bg-opacity-25 text-secondary border border-secondary'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm bg-black border-secondary text-white py-0 px-2 d-inline-block"
                        style={{ width: '110px', fontSize: '0.75rem' }}
                        value={rev.status}
                        onChange={(e) => handleStatusChange(rev._id, e.target.value)}
                      >
                        <option value="approved">Approve</option>
                        <option value="flagged">Flag</option>
                        <option value="hidden">Hide</option>
                      </select>
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
