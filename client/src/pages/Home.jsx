import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';
import { HeroSlider } from '../components/movie/HeroSlider';
import { MovieCard } from '../components/movie/MovieCard';
import { TrailerModal } from '../components/movie/TrailerModal';
import { Loader } from '../components/common/Loader';

export const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerMovie, setTrailerMovie] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featuredRes, nowShowingRes, comingSoonRes, theatresRes] = await Promise.all([
          movieService.getFeaturedMovies(),
          movieService.getMovies({ status: 'now_showing', limit: 8 }),
          movieService.getMovies({ status: 'coming_soon', limit: 4 }),
          theatreService.getTheatres()
        ]);

        setFeaturedMovies(featuredRes.data || []);
        setNowShowing(nowShowingRes.data || []);
        setComingSoon(comingSoonRes.data || []);
        setTheatres(theatresRes.data || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <Loader message="Setting up the cinema projection..." />;
  }

  return (
    <div className="container py-4">
      {/* Featured Hero Banner Carousel */}
      <HeroSlider
        movies={featuredMovies}
        onWatchTrailer={(movie) => setTrailerMovie(movie)}
      />

      {/* Now Showing Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-fire text-danger"></i> Now Showing in Cinemas
            </h2>
            <p className="text-secondary small mb-0">Catch the biggest blockbusters on giant screens today</p>
          </div>
          <Link to="/movies?status=now_showing" className="btn btn-cinema-outline btn-sm">
            View All ({nowShowing.length}) <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="row">
          {nowShowing.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-stars text-warning"></i> Coming Soon
              </h2>
              <p className="text-secondary small mb-0">Upcoming anticipated releases</p>
            </div>
            <Link to="/movies?status=coming_soon" className="btn btn-cinema-outline btn-sm">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row">
            {comingSoon.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Theatres Banner */}
      <section className="my-5 p-4 rounded-4 glass-panel">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="badge bg-danger text-uppercase fw-bold mb-2">IMMERSIVE CINEMA</span>
            <h3 className="text-white fw-bold mb-2">Next-Generation Theatres with IMAX Laser & Dolby Atmos</h3>
            <p className="text-secondary small mb-4">
              Explore our partnered multiplexes equipped with cutting-edge 4K laser projection, luxury VIP leather recliners, and gourmet dine-in service.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/theatres" className="btn btn-cinema btn-sm">
                <i className="bi bi-geo-alt-fill me-1"></i> Explore {theatres.length} Theatres
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="row g-2">
              {theatres.slice(0, 3).map((theatre) => (
                <div key={theatre._id} className="col-12">
                  <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-50 d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-white fw-bold mb-1">{theatre.name}</h6>
                      <p className="text-secondary extra-small mb-0">
                        <i className="bi bi-pin-map-fill text-danger me-1"></i>
                        {theatre.city} • {theatre.address}
                      </p>
                    </div>
                    <span className="badge bg-secondary bg-opacity-25 text-info border border-secondary">
                      {theatre.screens?.length || 2} Screens
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
      )}
    </div>
  );
};
