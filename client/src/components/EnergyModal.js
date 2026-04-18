import { useState, useEffect } from 'react';
import { createEnergyLevel } from '../api/api';
import './EnergyModal.css';

function EnergyModal({
  userId,
  onClose,
  onEnergyUpdated,
  latestEnergy: propLatestEnergy,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    physicalScore: '',
    mentalScore: '',
    emotionalScore: '',
    spiritualScore: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const latestEnergy = propLatestEnergy;

  const formatScore = (score) => {
    return score ? `${(score * 10).toFixed(0)}%` : 'N/A';
  };

  const isRecent = (recordedAt) => {
    if (!recordedAt) return false;
    const recorded = new Date(recordedAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return recorded >= oneHourAgo;
  };

  // Determine whether to show form based on energy data
  const shouldShowForm = !latestEnergy || !isRecent(latestEnergy.recordedAt);

  useEffect(() => {
    setShowForm(shouldShowForm);
  }, [shouldShowForm]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one score is provided
    const scores = [
      formData.physicalScore,
      formData.mentalScore,
      formData.emotionalScore,
      formData.spiritualScore,
    ].filter((score) => score !== '');

    if (scores.length === 0) {
      alert('Please enter at least one energy score');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      // Adjust for timezone offset to store local time as ISO string
      const localISOString = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      ).toISOString();

      const payload = {
        physicalScore: formData.physicalScore
          ? parseFloat(formData.physicalScore)
          : null,
        mentalScore: formData.mentalScore
          ? parseFloat(formData.mentalScore)
          : null,
        emotionalScore: formData.emotionalScore
          ? parseFloat(formData.emotionalScore)
          : null,
        spiritualScore: formData.spiritualScore
          ? parseFloat(formData.spiritualScore)
          : null,
        description: formData.description.trim() || null,
        recordedAt: localISOString,
      };

      const newEnergy = await createEnergyLevel(userId, payload);
      setShowForm(false);
      onEnergyUpdated?.(newEnergy);

      // Reset form
      setFormData({
        physicalScore: '',
        mentalScore: '',
        emotionalScore: '',
        spiritualScore: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to submit energy level:', error);
      alert('Failed to save energy level. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content energy-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Energy Levels</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {showForm ? (
            <div className="energy-form-container">
              <h3>Log Your Energy Levels</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="energy-scores-grid">
                  <div className="form-group">
                    <label htmlFor="physicalScore">Physical</label>
                    <input
                      id="physicalScore"
                      type="number"
                      name="physicalScore"
                      value={formData.physicalScore}
                      onChange={handleFormChange}
                      placeholder="1-10"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mentalScore">Mental</label>
                    <input
                      id="mentalScore"
                      type="number"
                      name="mentalScore"
                      value={formData.mentalScore}
                      onChange={handleFormChange}
                      placeholder="1-10"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emotionalScore">Emotional</label>
                    <input
                      id="emotionalScore"
                      type="number"
                      name="emotionalScore"
                      value={formData.emotionalScore}
                      onChange={handleFormChange}
                      placeholder="1-10"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="spiritualScore">Spiritual</label>
                    <input
                      id="spiritualScore"
                      type="number"
                      name="spiritualScore"
                      value={formData.spiritualScore}
                      onChange={handleFormChange}
                      placeholder="1-10"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Notes (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="How are you feeling? Any notes about your energy levels..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Energy Levels'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="energy-breakdown">
              <h3>Current Energy Levels</h3>
              {latestEnergy && isRecent(latestEnergy.recordedAt) ? (
                <div className="energy-details">
                  <div className="overall-score">
                    <div className="score-circle">
                      <span className="score-value">
                        {latestEnergy.overallScore
                          ? `${(latestEnergy.overallScore * 10).toFixed(0)}%`
                          : 'N/A'}
                      </span>
                      <span className="score-label">Overall</span>
                    </div>
                  </div>

                  <div className="energy-scores-breakdown">
                    <div className="score-item">
                      <span className="score-name">Physical:</span>
                      <span className="score-value">
                        {formatScore(latestEnergy.physicalScore)}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-name">Mental:</span>
                      <span className="score-value">
                        {formatScore(latestEnergy.mentalScore)}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-name">Emotional:</span>
                      <span className="score-value">
                        {formatScore(latestEnergy.emotionalScore)}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-name">Spiritual:</span>
                      <span className="score-value">
                        {formatScore(latestEnergy.spiritualScore)}
                      </span>
                    </div>
                  </div>

                  {latestEnergy.description && (
                    <div className="energy-notes">
                      <h4>Notes:</h4>
                      <p>{latestEnergy.description}</p>
                    </div>
                  )}

                  <div className="energy-timestamp">
                    <small>
                      Recorded:{' '}
                      {new Date(latestEnergy.recordedAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="no-recent-data">
                  <p>No recent energy data available.</p>
                  <button
                    className="log-energy-btn"
                    onClick={() => setShowForm(true)}
                  >
                    Log Energy Levels
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnergyModal;
