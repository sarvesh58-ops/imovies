import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/common/RatingStars';
import { TrailerModal } from '../components/movie/TrailerModal';
import { Loader } from '../components/common/Loader';

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [showtimesByTheatre, setShowtimesByTheatre] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCity, setSelectedCity] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(10);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Date selection tabs (Today + next 3 days)
  const dateTabs = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true);
      try {
        const movieRes = await movieService.getMovieById(id);
        setMovie(movieRes.data);

        // Fetch showtimes
        const showtimesRes = await movieService.getMovieShowtimes(movieRes.data._id, {
          date: selectedDate,
          city: selectedCity || undefined
        });
        setShowtimesByTheatre(showtimesRes.data || []);

        // Fetch reviews
        const reviewsRes = await movieService.getMovieReviews(movieRes.data._id);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id, selectedDate, selectedCity]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please enter a review comment', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await movieService.addReview(movie._id, {
        rating: Number(reviewRating),
        title: reviewTitle,
        comment: reviewComment
      });

      showToast('Review posted successfully!', 'success');
      setReviews((prev) => [res.data, ...prev]);
      setReviewTitle('');
      setReviewComment('');
      // Refresh movie to get updated rating average
      const updatedMovie = await movieService.getMovieById(movie._id);
      setMovie(updatedMovie.data);
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader message="Loading movie details and showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Movie Not Found</h3>
        <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Hero Banner Backdrop */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div
          className="position-absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 13, 20, 0.7) 0%, rgba(10, 13, 20, 0.95) 85%, #0A0D14 100%)',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        ></div>

        <div className="container position-relative py-4" style={{ zIndex: 2 }}>
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div className="rounded-4 overflow-hidden shadow-2xl border border-secondary border-opacity-50 position-relative d-inline-block">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="img-fluid"
                  style={{ maxHeight: '420px', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-danger px-2.5 py-1 text-uppercase" style={{ fontSize: '0.75rem' }}>
                  {movie.status === 'coming_soon' ? 'Coming Soon' : 'Now Showing'}
                </span>
                <span className="badge bg-dark border border-secondary text-light px-2.5 py-1">
                  {movie.certificate || 'UA'}
                </span>
                <span className="text-secondary small">
                  <i className="bi bi-clock me-1 text-danger"></i>
                  {movie.durationMinutes} mins
                </span>
                <span className="text-secondary small">
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(movie.releaseDate).getFullYear()}
                </span>
              </div>

              <h1 className="display-5 fw-bolder text-white mb-2">{movie.title}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <RatingStars rating={movie.ratingAverage} count={movie.ratingCount} max={10} />
              </div>

              {/* Genres and Languages */}
              <div className="d-flex gap-2 flex-wrap mb-3">
                {movie.genres?.map((genre) => (
                  <span key={genre} className="badge bg-secondary bg-opacity-25 border border-secondary text-light px-3 py-1.5">
                    {genre}
                  </span>
                ))}
                {movie.languages?.map((lang) => (
                  <span key={lang} className="badge bg-dark border border-secondary text-secondary px-3 py-1.5">
                    {lang}
                  </span>
                ))}
              </div>

              <p className="text-secondary small mb-3" style={{ maxWidth: '750px', lineHeight: 1.6 }}>
                {movie.description}
              </p>

              {movie.director && (
                <p className="text-secondary small mb-3">
                  <span className="text-white fw-bold">Director:</span> {movie.director}
                </p>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-3 flex-wrap mt-4">
                {movie.status === 'now_showing' ? (
                  <a href="#showtimes-section" className="btn btn-cinema px-4 py-2">
                    <i className="bi bi-ticket-perforated-fill me-2"></i> Book Tickets
                  </a>
                ) : (
                  <button className="btn btn-secondary px-4 py-2 disabled">
                    <i className="bi bi-calendar-event me-2"></i> Coming Soon
                  </button>
                )}
                {movie.trailerUrl && (
                  <button
                    type="button"
                    className="btn btn-cinema-outline px-4 py-2 d-flex align-items-center gap-2"
                    onClick={() => setTrailerOpen(true)}
                  >
                    <i className="bi bi-play-circle-fill text-danger fs-5"></i>
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <section className="mb-5">
            <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-people-fill text-danger"></i> Cast & Characters
            </h4>
            <div className="row g-3">
              {movie.cast.map((actor, idx) => (
                <div key={idx} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div className="card glass-panel border-secondary p-2 text-center h-100">
                    <img
                      src={actor.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${actor.name}`}
                      alt={actor.name}
                      className="rounded-3 img-fluid mb-2"
                      style={{ height: '140px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${actor.name}`;
                      }}
                    />
                    <h6 className="text-white fw-bold small mb-0 text-truncate">{actor.name}</h6>
                    <p className="text-secondary extra-small mb-0 text-truncate">{actor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Showtimes & Theatres Section */}
        {movie.status === 'now_showing' && (
          <section id="showtimes-section" className="mb-5 pt-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
              <div>
                <h3 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-danger"></i> Select Date & Showtime
                </h3>
                <p className="text-secondary small mb-0">Pick your preferred theatre and screening time</p>
              </div>

              {/* Date Filter Tabs */}
              <div className="d-flex gap-2 overflow-x-auto pb-2">
                {dateTabs.map((tab) => (
                  <button
                    key={tab.iso}
                    type="button"
                    className={`btn btn-sm px-3 py-2 text-center rounded-3 ${
                      selectedDate === tab.iso ? 'btn-danger' : 'btn-dark border-secondary text-secondary'
                    }`}
                    onClick={() => setSelectedDate(tab.iso)}
                  >
                    <div className="fw-bold small">{tab.label}</div>
                    <div className="extra-small opacity-75" style={{ fontSize: '0.7rem' }}>{tab.formatted}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theatres & Times Grid */}
            {showtimesByTheatre.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <i className="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
                <h5 className="text-white fw-bold">No Showtimes Available for this Date</h5>
                <p className="text-secondary small mb-0">Try selecting another date from the tabs above.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {showtimesByTheatre.map((group) => (
                  <div key={group.theatre._id} className="card glass-panel border-secondary p-4">
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 border-bottom border-secondary border-opacity-50 pb-3 gap-2">
                      <div>
                        <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                          <i className="bi bi-building text-danger"></i>
                          {group.theatre.name}
                        </h5>
                        <p className="text-secondary small mb-0">
                          <i className="bi bi-geo-alt me-1"></i>
                          {group.theatre.address} • {group.theatre.city}
                        </p>
                      </div>
                      <div className="d-flex gap-1 flex-wrap">
                        {group.theatre.amenities?.map((amenity, i) => (
                          <span key={i} className="badge bg-secondary bg-opacity-25 text-light extra-small">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtime Buttons */}
                    <div className="d-flex gap-3 flex-wrap">
                      {group.showtimes.map((st) => (
                        <Link
                          key={st._id}
                          to={`/booking/${st._id}`}
                          className="btn btn-dark border-secondary bg-opacity-75 p-2 px-3 text-start hover-border-danger rounded-3 text-decoration-none"
                          style={{ minWidth: '130px', transition: 'all 0.2s' }}
                        >
                          <div className="text-white fw-bold fs-6">
                            {new Date(st.startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="d-flex justify-content-between align-items-center text-secondary extra-small mt-1" style={{ fontSize: '0.75rem' }}>
                            <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">{st.format}</span>
                            <span>${st.pricing?.standard?.toFixed(0)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-chat-square-quote-fill text-danger"></i> Customer Ratings & Reviews
              </h4>
              <p className="text-secondary small mb-0">Verified experiences from moviegoers</p>
            </div>
            <RatingStars rating={movie.ratingAverage} count={reviews.length} max={10} />
          </div>

          <div className="row g-4">
            {/* Reviews List */}
            <div className="col-lg-7">
              {reviews.length === 0 ? (
                <div className="p-4 rounded-4 glass-panel text-center">
                  <p className="text-secondary mb-0">No reviews yet for this movie. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="card glass-panel border-secondary p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.user?.name}`}
                            alt="avatar"
                            className="rounded-circle border border-secondary"
                            style={{ width: '32px', height: '32px' }}
                          />
                          <div>
                            <span className="text-white fw-bold small d-block">{rev.user?.name || 'Verified Moviegoer'}</span>
                            <span className="text-secondary extra-small" style={{ fontSize: '0.7rem' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          {rev.isVerifiedBooking && (
                            <span className="badge bg-success bg-opacity-25 text-success border border-success extra-small">
                              <i className="bi bi-patch-check-fill me-1"></i> Verified
                            </span>
                          )}
                          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning">
                            ★ {rev.rating}/10
                          </span>
                        </div>
                      </div>

                      {rev.title && <h6 className="text-white fw-bold mb-1 small">{rev.title}</h6>}
                      <p className="text-secondary small mb-0">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Box */}
            <div className="col-lg-5">
              <div className="card glass-panel border-secondary p-4 sticky-top" style={{ top: '90px' }}>
                <h5 className="text-white fw-bold mb-2">Write a Review</h5>
                <p className="text-secondary small mb-3">How was your cinema experience with {movie.title}?</p>

                <form onSubmit={handleReviewSubmit}>
                  {/* Rating Selector */}
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Your Rating (1 to 10)</label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="range"
                        className="form-range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(e.target.value)}
                      />
                      <span className="badge bg-danger fs-6 px-3 py-1.5 fw-bold">{reviewRating} / 10</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Review Headline (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark border-secondary text-white"
                      placeholder="e.g. Masterpiece sound and visuals!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Your Thoughts</label>
                    <textarea
                      className="form-control form-control-sm bg-dark border-secondary text-white"
                      rows="3"
                      placeholder="Share details of the performance, pacing, audio/video..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-cinema w-100 btn-sm"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <TrailerModal movie={movie} onClose={() => setTrailerOpen(false)} />
      )}
    </div>
  );
};
