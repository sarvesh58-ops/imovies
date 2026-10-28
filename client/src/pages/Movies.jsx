import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieFilters } from '../components/movie/MovieFilters';
import { TrailerModal } from '../components/movie/TrailerModal';
import { Loader } from '../components/common/Loader';

export const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerMovie, setTrailerMovie] = useState(null);

  // Filter states
  const search = searchParams.get('search') || '';
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'releaseDate_desc');

  const genresList = ['Action', 'Adventure', 'Sci-Fi', 'Drama', 'Biography', 'History', 'Crime', 'Animation'];
  const languagesList = ['English', 'Spanish', 'French', 'German'];

  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = {
          status: selectedStatus,
          genre: selectedGenre,
          language: selectedLanguage,
          sort: selectedSort,
          search: search || undefined
        };
        const res = await movieService.getMovies(params);
        setMovies(res.data || []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [selectedStatus, selectedGenre, selectedLanguage, selectedSort, search]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateSearchParams({ status });
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    updateSearchParams({ genre });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    updateSearchParams({ language });
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateSearchParams({ sort });
  };

  const updateSearchParams = (updates) => {
    const current = Object.fromEntries(searchParams.entries());
    const next = { ...current, ...updates };
    Object.keys(next).forEach((key) => {
      if (next[key] === 'all' || !next[key]) delete next[key];
    });
    setSearchParams(next);
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h2 className="text-white fw-bold mb-1 brand-font">Explore Movies</h2>
          <p className="text-secondary small mb-0">
            {search ? (
              <span>Search results for: <span className="text-white fw-bold">"{search}"</span></span>
            ) : (
              'Discover current cinema releases, showtimes, and ratings'
            )}
          </p>
        </div>
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-secondary px-3 py-2">
          {movies.length} {movies.length === 1 ? 'Movie found' : 'Movies found'}
        </span>
      </div>

      {/* Filter Bar */}
      <MovieFilters
        genres={genresList}
        languages={languagesList}
        selectedGenre={selectedGenre}
        selectedLanguage={selectedLanguage}
        selectedStatus={selectedStatus}
        selectedSort={selectedSort}
        onGenreChange={handleGenreChange}
        onLanguageChange={handleLanguageChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
      />

      {/* Movies Grid */}
      {loading ? (
        <Loader message="Loading movies..." />
      ) : movies.length === 0 ? (
        <div className="text-center py-5 my-5 glass-panel">
          <i className="bi bi-film fs-1 text-secondary opacity-50 mb-3 d-block"></i>
          <h4 className="text-white fw-bold">No movies found</h4>
          <p className="text-secondary small">Try adjusting your filters or search keywords.</p>
          <button
            type="button"
            className="btn btn-cinema-outline btn-sm mt-2"
            onClick={() => {
              setSelectedStatus('all');
              setSelectedGenre('all');
              setSelectedLanguage('all');
              setSearchParams({});
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
      )}
    </div>
  );
};
