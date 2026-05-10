import './AnalyticsPage.css';
import { useEffect, useMemo, useState } from 'react';
import { getUserCategoryScores } from '../api/api';

const CATEGORY_NAMES = {
  0: 'Not Specified',
  1: 'Wealth',
  2: 'Fitness',
  3: 'Social',
  4: 'Spirit',
  5: 'Health',
  6: 'Education',
  7: 'Career',
  8: 'Creativity',
  9: 'Family',
  10: 'Adventure',
  11: 'Leadership',
  12: 'Happiness',
};

const getXpThreshold = (level) => 50 * Math.pow(level, 1.4);

function AnalyticsPage({ userId }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getUserCategoryScores(userId);
        setScores(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [userId]);

  const rows = useMemo(() => {
    return scores.map((item) => {
      const currentLevel = item.levelNumber;
      const nextLevel = currentLevel + 1;
      const currentThreshold = getXpThreshold(currentLevel);
      const nextThreshold = getXpThreshold(nextLevel);
      const levelSpan = Math.max(nextThreshold - currentThreshold, 1);

      // Score in DB is treated as progress toward next level.
      const progressPercent = Math.min(
        100,
        Math.max(0, (item.score / levelSpan) * 100),
      );

      return {
        categoryName: CATEGORY_NAMES[item.categoryId] || `Category ${item.categoryId}`,
        currentLevel,
        nextLevel,
        progressPercent,
        progressLabel: `${Math.round(progressPercent)}%`,
      };
    });
  }, [scores]);

  if (loading) {
    return (
      <div className="analytics-card">
        <h2>Analytics</h2>
        <p>Loading category scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-card">
        <h2>Analytics</h2>
        <p className="analytics-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="analytics-card">
      <h2>Analytics</h2>

      {rows.length === 0 ? (
        <p>No category score data yet.</p>
      ) : (
        <div className="analytics-list">
          {rows.map((row) => (
            <div
              key={row.categoryName}
              className="analytics-row"
            >
              <div className="analytics-row-main">
                <div>
                  <div className="analytics-category">{row.categoryName}</div>
                </div>

                <div>
                  <div className="analytics-progress-head">
                    <span className="analytics-progress-label">Level {row.currentLevel}</span>
                    <span className="analytics-progress-value">Level {row.nextLevel}</span>
                  </div>
                  <div className="analytics-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(row.progressPercent)} aria-label={`${row.categoryName} progress`}>
                    <div
                      className="analytics-progress-fill"
                      style={{ width: `${row.progressPercent}%` }}
                    >
                      <span className="analytics-progress-marker">{row.progressLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-row-side">
                <button className="analytics-details-btn" type="button" disabled>
                  ...
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
