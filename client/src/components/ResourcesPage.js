import { useState } from 'react';
import { getResources } from '../api/api';
import './ResourcesPage.css';

const RESOURCE_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
  { value: 'video', label: 'Videos' },
  { value: 'article', label: 'Articles' },
  { value: 'podcast', label: 'Podcasts' },
];

function ResourcesPage({ userId }) {
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || selectedTypes.length === 0) {
      setError('Please enter a query and select at least one resource type.');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentPage(1);

    try {
      const data = await getResources(
        userId,
        query.trim(),
        selectedTypes.join(','),
        1,
        10,
      );
      setResources(data.items || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message);
      setResources([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setLoading(true);
    setError('');
    setCurrentPage(page);

    try {
      const data = await getResources(
        userId,
        query.trim(),
        selectedTypes.join(','),
        page,
        10,
      );
      setResources(data.items || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message);
      setResources([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const renderResourceItem = (item, index) => (
    <div key={`resource-${currentPage}-${index}`} className="resource-item">
      <div className="resource-left">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-name"
          >
            {item.name}
          </a>
        ) : (
          <span className="resource-name">{item.name}</span>
        )}
        <span className="resource-type">{item.type}</span>
      </div>
      <div className="resource-description">{item.description}</div>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
          disabled={loading}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          ‹
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          ›
        </button>
      </div>
    );
  };

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h2>Resource Recommendations</h2>
        <p>
          Get personalized recommendations for movies, books, videos, articles,
          and podcasts using AI.
        </p>
      </div>

      <form className="resources-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="query">What are you interested in?</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., productivity, mindfulness, career development..."
            className="query-input"
          />
        </div>

        <div className="form-group">
          <label>Resource Types</label>
          <div className="resource-types">
            {RESOURCE_TYPES.map((type) => (
              <label key={type.value} className="type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => handleTypeToggle(type.value)}
                />
                <span className="checkmark"></span>
                {type.label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Get Recommendations'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {resources.length > 0 && (
        <div className="resources-results">
          <h3>Recommended Resources</h3>
          <div className="resources-list">
            {resources.map(renderResourceItem)}
          </div>
          {renderPagination()}
        </div>
      )}

      {loading && resources.length === 0 && (
        <div className="loading-message">
          Finding the best resources for you...
        </div>
      )}
    </div>
  );
}

export default ResourcesPage;
