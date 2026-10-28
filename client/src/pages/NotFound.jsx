import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="container py-5 my-5 text-center">
      <div className="display-1 fw-bolder text-danger brand-font mb-2">404</div>
      <h2 className="text-white fw-bold mb-2">Scene Not Found</h2>
      <p className="text-secondary small mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
        The reel you are looking for does not exist, has been archived, or moved to a different screening.
      </p>
      <Link to="/" className="btn btn-cinema px-4">
        <i className="bi bi-house me-2"></i> Return to Home
      </Link>
    </div>
  );
};
