import React from 'react';

export const StatWidget = ({ title, value, icon, color = 'danger', subtitle = null }) => {
  return (
    <div className="card glass-panel border-secondary p-3 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-secondary extra-small text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h3 className="text-white fw-bold mb-0 mt-1">{value}</h3>
          {subtitle && <p className="text-secondary extra-small mb-0 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`rounded-3 bg-${color} bg-opacity-15 text-${color} p-3 d-flex align-items-center justify-content-center shadow-sm`}
          style={{ width: '52px', height: '52px' }}
        >
          <i className={`bi ${icon} fs-4`}></i>
        </div>
      </div>
    </div>
  );
};
