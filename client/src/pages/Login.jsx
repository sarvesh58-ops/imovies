import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Error handled by AuthContext via Toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@imovies.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card glass-panel border-secondary p-4 p-md-5 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 bg-danger bg-gradient text-white mb-3 shadow"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-film fs-4"></i>
              </div>
              <h3 className="text-white fw-bold brand-font mb-1">Welcome Back</h3>
              <p className="text-secondary small mb-0">Sign in to your IMovies account</p>
            </div>

            {/* Quick Demo Credentials for Evaluation */}
            <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-50 mb-4">
              <span className="text-secondary extra-small text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.7rem' }}>
                Quick Evaluation Credentials
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-dark border-secondary btn-sm flex-grow-1 text-danger fw-semibold"
                  onClick={() => handleQuickFill('admin')}
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin Demo
                </button>
                <button
                  type="button"
                  className="btn btn-dark border-secondary btn-sm flex-grow-1 text-info fw-semibold"
                  onClick={() => handleQuickFill('user')}
                >
                  <i className="bi bi-person me-1"></i> User Demo
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema w-100 py-2.5 mb-3 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="text-center text-secondary small">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
