import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { theatreService } from '../services/theatreService';
import { Loader } from '../components/common/Loader';

export const Theatres = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  const cityFilter = searchParams.get('city') || 'all';
  const cities = ['All', 'New York', 'Los Angeles', 'Chicago'];

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const res = await theatreService.getTheatres({
          city: cityFilter !== 'All' && cityFilter !== 'all' ? cityFilter : undefined
        });
        setTheatres(res.data || []);
      } catch (err) {
        console.error('Failed to fetch theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [cityFilter]);

  const handleCityChange = (city) => {
    if (city === 'All' || city === 'all') {
      searchParams.delete('city');
    } else {
      searchParams.set('city', city);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="text-white fw-bold mb-1 brand-font">Partner Theatres</h2>
          <p className="text-secondary small mb-0">
            Experience movies in ultra-high fidelity across our certified auditoriums
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="d-flex gap-2 flex-wrap">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-sm px-3 rounded-pill ${
                (cityFilter === c || (cityFilter === 'all' && c === 'All'))
                  ? 'btn-danger'
                  : 'btn-dark border-secondary text-secondary'
              }`}
              onClick={() => handleCityChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading cinema theatres..." />
      ) : theatres.length === 0 ? (
        <div className="text-center py-5 glass-panel">
          <i className="bi bi-building-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
          <h5 className="text-white fw-bold">No Theatres in this City</h5>
          <p className="text-secondary small">Please select another city or check back soon.</p>
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((theatre) => (
            <div key={theatre._id} className="col-lg-6">
              <div className="card glass-panel border-secondary p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="text-white fw-bold mb-0">{theatre.name}</h4>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                      {theatre.city}
                    </span>
                  </div>

                  <p className="text-secondary small mb-3">
                    <i className="bi bi-geo-alt text-danger me-1"></i>
                    {theatre.address}
                  </p>

                  {/* Amenities */}
                  <div className="mb-3">
                    <label className="text-secondary extra-small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.7rem' }}>
                      Auditorium Amenities
                    </label>
                    <div className="d-flex flex-wrap gap-1.5">
                      {theatre.amenities?.map((amenity, i) => (
                        <span key={i} className="badge bg-dark border border-secondary text-light extra-small">
                          <i className="bi bi-check2 text-danger me-1"></i>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Screens */}
                  <div className="mb-3">
                    <label className="text-secondary extra-small text-uppercase fw-semibold mb-2" style={{ fontSize: '0.7rem' }}>
                      Available Screens ({theatre.screens?.length || 0})
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {theatre.screens?.map((scr) => (
                        <div key={scr._id} className="p-2 rounded-2 bg-dark border border-secondary extra-small">
                          <span className="text-white fw-bold d-block">{scr.name}</span>
                          <span className="text-secondary">{scr.screenType} • {scr.totalSeats} Seats</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary border-opacity-50 mt-3 d-flex align-items-center justify-content-between">
                  <span className="text-secondary small">
                    <i className="bi bi-telephone me-1"></i>
                    {theatre.contactPhone || 'Contact Desk Available'}
                  </span>
                  <Link to="/movies" className="btn btn-cinema btn-sm">
                    View Movies <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
