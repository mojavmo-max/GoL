import { useState, useEffect, useCallback } from 'react';
import { getDailyTracker, saveDailyTracker } from '../api/api';
import './TrackerPage.css';

const todayString = () => new Date().toISOString().slice(0, 10);

const createEmptyPlan = (date) => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  date,
  time: '',
  description: '',
  isCompleted: false,
});

const normalizePlans = (plans, date) => {
  const mapped = plans.map((plan) => ({
    key: plan.id
      ? `plan-${plan.id}`
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date,
    time: plan.time || '',
    description: plan.description || '',
    isCompleted: plan.isCompleted || false,
  }));
  return mapped.length
    ? [...mapped, createEmptyPlan(date)]
    : [createEmptyPlan(date)];
};

const cleanPlansForSave = (plans) =>
  plans
    .filter(
      (plan) => plan.time.trim() || plan.description.trim() || plan.isCompleted,
    )
    .map((plan) => ({
      date: plan.date,
      time: plan.time,
      description: plan.description,
      isCompleted: plan.isCompleted,
    }));

function TrackerPage({ userId }) {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [plans, setPlans] = useState([createEmptyPlan(todayString())]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadTracker = useCallback(
    async (date) => {
      setLoading(true);
      try {
        const data = await getDailyTracker(userId, date);
        if (data && data.plans) {
          setPlans(normalizePlans(data.plans, date));
        } else {
          setPlans([createEmptyPlan(date)]);
        }
        setDirty(false);
      } catch (error) {
        console.error('Failed to load tracker:', error);
        setPlans([createEmptyPlan(date)]);
        setDirty(false);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    loadTracker(selectedDate);
  }, [loadTracker, selectedDate]);

  const saveTracker = useCallback(
    async (dateToSave = selectedDate, plansToSave = plans) => {
      const filteredPlans = cleanPlansForSave(plansToSave);
      if (!filteredPlans.length) {
        try {
          await saveDailyTracker(userId, { date: dateToSave, plans: [] });
          setDirty(false);
        } catch (error) {
          console.error('Failed to save empty tracker:', error);
        }
        return;
      }

      setSaving(true);
      try {
        await saveDailyTracker(userId, {
          date: dateToSave,
          plans: filteredPlans,
        });
        setDirty(false);
      } catch (error) {
        console.error('Failed to save tracker:', error);
      } finally {
        setSaving(false);
      }
    },
    [plans, selectedDate, userId],
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      const filteredPlans = cleanPlansForSave(plans);
      if (!dirty || !filteredPlans.length) return;

      const payload = JSON.stringify({
        date: selectedDate,
        plans: filteredPlans,
      });
      const endpoint = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5118'}/tracker/${userId}`;
      try {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      } catch (error) {
        console.error('Failed to save tracker before unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTracker();
    };
  }, [dirty, plans, saveTracker, selectedDate, userId]);

  const handleDateChange = async (event) => {
    const newDate = event.target.value;
    if (newDate === selectedDate) return;
    await saveTracker(selectedDate, plans);
    setSelectedDate(newDate);
  };

  const updatePlan = (index, field, value) => {
    setPlans((previous) => {
      const next = previous.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [field]: value } : plan,
      );

      const isLastRow = index === previous.length - 1;
      if (
        isLastRow &&
        (((field === 'time' || field === 'description') && value.trim()) ||
          (field === 'isCompleted' && value === true))
      ) {
        next.push(createEmptyPlan(selectedDate));
      }

      return next;
    });
    setDirty(true);
  };

  const renderRows = () =>
    plans.map((plan, index) => (
      <div className="tracker-row" key={plan.key}>
        <input
          type="time"
          className="tracker-time"
          value={plan.time}
          onChange={(event) => updatePlan(index, 'time', event.target.value)}
          placeholder="HH:MM"
        />
        <textarea
          className="tracker-description"
          rows={1}
          value={plan.description}
          onChange={(event) =>
            updatePlan(index, 'description', event.target.value)
          }
          placeholder="Description"
        />
        <label className="tracker-checkbox-label">
          <input
            type="checkbox"
            checked={plan.isCompleted}
            onChange={(event) => {
              const newValue = event.target.checked;
              if (newValue && !plan.description.trim()) {
                return;
              }
              updatePlan(index, 'isCompleted', newValue);
            }}
          />
        </label>
      </div>
    ));

  return (
    <div className="tracker-page">
      <div className="tracker-topbar">
        <div className="tracker-title">
          <h2>Daily Tracker</h2>
          <p>Track your day with a simple plan sheet.</p>
        </div>
        <div className="tracker-date-picker">
          <label htmlFor="tracker-date">Date</label>
          <input
            id="tracker-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <div className="tracker-status-row">
        {loading ? (
          <span>Loading tracker...</span>
        ) : saving ? (
          <span>Saving changes...</span>
        ) : dirty ? (
          <span>Unsaved changes will save automatically.</span>
        ) : (
          <span>Changes are saved.</span>
        )}
      </div>

      <div className="tracker-sheet">
        <div className="tracker-row tracker-row-header">
          <div>Time</div>
          <div>Description</div>
          <div>Completed</div>
        </div>
        {renderRows()}
      </div>
    </div>
  );
}

export default TrackerPage;
