import React from 'react';

export const MovieFilters = ({
  genres,
  languages,
  selectedGenre,
  selectedLanguage,
  selectedStatus,
  selectedSort,
  onGenreChange,
  onLanguageChange,
  onStatusChange,
  onSortChange
}) => {
  return (
    <div className="glass-panel p-3 mb-4">
      <div className="row g-3 align-items-center">
        {/* Status Tab Toggle */}
        <div className="col-lg-4 col-md-12">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-sm ${selectedStatus === 'all' ? 'btn-danger' : 'btn-dark border-secondary text-secondary'}`}
              onClick={() => onStatusChange('all')}
            >
              All Movies
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedStatus === 'now_showing' ? 'btn-danger' : 'btn-dark border-secondary text-secondary'}`}
              onClick={() => onStatusChange('now_showing')}
            >
              Now Showing
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedStatus === 'coming_soon' ? 'btn-danger' : 'btn-dark border-secondary text-secondary'}`}
              onClick={() => onStatusChange('coming_soon')}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="col-lg-3 col-sm-4">
          <select
            className="form-select form-select-sm bg-dark border-secondary text-white"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div className="col-lg-2 col-sm-4">
          <select
            className="form-select form-select-sm bg-dark border-secondary text-white"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="all">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="col-lg-3 col-sm-4">
          <select
            className="form-select form-select-sm bg-dark border-secondary text-white"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="releaseDate_desc">Newest Releases</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="title_desc">Title (Z - A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
