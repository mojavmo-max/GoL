import './App.css';
import { useState, useEffect, useCallback } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import GoalsList from './components/GoalsList';
import Settings from './components/Settings';
import BudgetModal from './components/BudgetModal';
import EnergyModal from './components/EnergyModal';
import TrackerPage from './components/TrackerPage';
import ResourcesPage from './components/ResourcesPage';
import { getBudgetSummary } from './api/api';
import { getLatestEnergyLevel } from './api/api';

function App() {
  const [user, setUser] = useState(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('gol-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [goalRefreshToken, setGoalRefreshToken] = useState(0);
  const [activePage, setActivePage] = useState('values');
  const [budget, setBudget] = useState({ netBudget: 0, loading: true });
  const [budgetPreview, setBudgetPreview] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [energy, setEnergy] = useState({ level: null, loading: true });
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [energyModalKey, setEnergyModalKey] = useState(0);
  const [showEnergyBanner, setShowEnergyBanner] = useState(false);

  const saveUserSession = (userData) => {
    localStorage.setItem('gol-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gol-user');
    setUser(null);
  };

  const handleEnergyUpdate = (newEnergyLevel) => {
    setEnergy((prev) => ({
      ...prev,
      level: newEnergyLevel,
    }));
  };

  const isEnergyRecent = useCallback((recordedAt) => {
    if (!recordedAt) return false;
    const recorded = new Date(recordedAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return recorded >= oneHourAgo;
  }, []);

  const getBatteryEmoji = (overallScore) => {
    if (!overallScore) return '🔋';
    const percentage = overallScore * 10; // Convert to 0-100 scale
    if (percentage <= 20) return '🪫'; // Low battery
    if (percentage <= 40) return '🔋'; // 25-40%
    if (percentage <= 60) return '🔋'; // 40-60%
    if (percentage <= 80) return '🔋'; // 60-80%
    return '⚡'; // 80-100% - fully charged
  };

  const getEnergyStatusColor = (overallScore) => {
    if (!overallScore) return '#6b7280'; // Gray for N/A
    const percentage = overallScore * 10;
    if (percentage > 80) return '#10b981'; // Green
    if (percentage >= 20) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const handleDismissEnergyBanner = () => {
    localStorage.setItem('energy-banner-dismissed', new Date().toISOString());
    setShowEnergyBanner(false);
  };

  const handleEnergyBannerClick = () => {
    setShowEnergyModal(true);
    setEnergyModalKey((prev) => prev + 1);
    setShowEnergyBanner(false);
  };

  useEffect(() => {
    if (user) {
      const fetchBudget = async () => {
        try {
          const data = await getBudgetSummary(user.id, new Date(), true);
          setBudget({ netBudget: data.netBudget, loading: false });
        } catch (error) {
          console.error('Failed to fetch budget:', error);
          setBudget({ netBudget: 0, loading: false });
        }
      };
      fetchBudget();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchEnergy = async () => {
        try {
          const data = await getLatestEnergyLevel(user.id);
          setEnergy({ level: data, loading: false });
        } catch (error) {
          console.error('Failed to fetch energy:', error);
          setEnergy({ level: null, loading: false });
        }
      };
      fetchEnergy();
    }
  }, [user]);

  // Check for energy banner every 5 minutes
  useEffect(() => {
    if (!user || energy.loading) return;

    const checkEnergyBanner = () => {
      const lastDismissed = localStorage.getItem('energy-banner-dismissed');
      const dismissedTime = lastDismissed ? new Date(lastDismissed) : null;

      // Don't show banner if dismissed within the last 15 minutes
      if (
        dismissedTime &&
        Date.now() - dismissedTime.getTime() < 15 * 60 * 1000
      ) {
        setShowEnergyBanner(false);
        return;
      }

      // Show banner if energy is stale (>1 hour old) or doesn't exist
      const shouldShow =
        !energy.level || !isEnergyRecent(energy.level.recordedAt);
      setShowEnergyBanner(shouldShow);
    };

    // Check immediately
    checkEnergyBanner();

    // Check every 5 minutes
    const interval = setInterval(checkEnergyBanner, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, energy, isEnergyRecent]);

  if (!user) {
    return (
      <div className="App app-center">
        <div className="auth-card">
          <div className="welcome-panel">
            <h1>Welcome to the Game of Life</h1>
            <p>Log in or register to save your goals and progress.</p>
          </div>
          <div className="auth-grid">
            <RegisterForm onRegister={setUser} />
            <LoginForm onLogin={saveUserSession} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <button
            className="budget-field"
            onClick={() => setShowBudgetModal(true)}
          >
            <span className="budget-icon">💰</span>
            <span className="budget-amount">
              {budget.loading
                ? 'Loading...'
                : `$${(budgetPreview !== null ? budgetPreview : budget.netBudget).toFixed(2)}`}
            </span>
          </button>
        </div>
        <div className="header-center">
          <img src="/gol-logo.png" className="app-logo" alt="Game of Life" />
        </div>
        <div className="header-right">
          <button
            className="energy-field"
            onClick={() => {
              setShowEnergyModal(true);
              setEnergyModalKey((prev) => prev + 1);
            }}
            title="View Energy Levels"
          >
            <span className="energy-icon">
              {getBatteryEmoji(energy.level?.overallScore)}
            </span>
            <span
              className="energy-level"
              style={{
                color: getEnergyStatusColor(
                  energy.level && isEnergyRecent(energy.level.recordedAt)
                    ? energy.level.overallScore
                    : null,
                ),
              }}
            >
              {energy.loading
                ? 'Loading...'
                : energy.level && isEnergyRecent(energy.level.recordedAt)
                  ? `${energy.level.overallScore ? `${(energy.level.overallScore * 10).toFixed(0)}%` : 'N/A'}`
                  : 'N/A'}
            </span>
          </button>
        </div>
      </header>

      {showEnergyBanner && (
        <div className="energy-banner">
          <div className="energy-banner-content">
            <span className="energy-banner-icon">🔋</span>
            <span className="energy-banner-text">
              It's been over an hour since you updated your energy levels. How
              are you feeling?
            </span>
            <div className="energy-banner-actions">
              <button
                className="energy-banner-update-btn"
                onClick={handleEnergyBannerClick}
              >
                Update Energy
              </button>
              <button
                className="energy-banner-dismiss-btn"
                onClick={handleDismissEnergyBanner}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {activePage === 'profile' ? (
          <UserProfile userId={user.id} />
        ) : activePage === 'values' ? (
          <GoalsList
            userId={user.id}
            refreshToken={goalRefreshToken}
            onGoalCreated={() => setGoalRefreshToken((prev) => prev + 1)}
          />
        ) : activePage === 'settings' ? (
          <Settings
            onNavigateToProfile={() => setActivePage('profile')}
            onLogout={logout}
          />
        ) : activePage === 'tracker' ? (
          <TrackerPage userId={user.id} />
        ) : activePage === 'resources' ? (
          <ResourcesPage userId={user.id} />
        ) : (
          <div className="placeholder-card">
            <h2>{activePage === 'analytics' ? 'Analytics' : 'Resources'}</h2>
            <p>
              This page is a placeholder for the {activePage} section. Add
              content here later.
            </p>
          </div>
        )}
      </main>

      <footer className="app-bottom-nav">
        <button
          className={`nav-btn ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => setActivePage('settings')}
          title="Settings"
        >
          ⚙️
        </button>
        <button
          className={`nav-btn ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => setActivePage('analytics')}
          title="Analytics"
        >
          📊
        </button>
        <button
          className={`nav-btn ${activePage === 'values' ? 'active' : ''}`}
          onClick={() => setActivePage('values')}
          title="Values"
        >
          🎯
        </button>
        <button
          className={`nav-btn ${activePage === 'tracker' ? 'active' : ''}`}
          onClick={() => setActivePage('tracker')}
          title="Tracker"
        >
          📈
        </button>
        <button
          className={`nav-btn ${activePage === 'resources' ? 'active' : ''}`}
          onClick={() => setActivePage('resources')}
          title="Resources"
        >
          📚
        </button>
      </footer>

      {showBudgetModal && (
        <BudgetModal
          userId={user.id}
          currentNetBudget={budget.netBudget}
          onBudgetPreviewChange={setBudgetPreview}
          onBudgetSaved={(formType, amount) =>
            setBudget((prev) => ({
              ...prev,
              netBudget:
                prev.netBudget + (formType === 'income' ? amount : -amount),
            }))
          }
          onClose={() => {
            setShowBudgetModal(false);
            setBudgetPreview(null);
          }}
        />
      )}

      {showEnergyModal && (
        <EnergyModal
          key={energyModalKey}
          userId={user.id}
          latestEnergy={energy.level}
          onClose={() => setShowEnergyModal(false)}
          onEnergyUpdated={handleEnergyUpdate}
        />
      )}
    </div>
  );
}

export default App;
