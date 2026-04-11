import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import GoalsList from './components/GoalsList';
import GoalForm from './components/GoalForm';
import Settings from './components/Settings';
import BudgetModal from './components/BudgetModal';
import { getBudgetSummary } from './api/api';

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

  const saveUserSession = (userData) => {
    localStorage.setItem('gol-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gol-user');
    setUser(null);
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
          <div className="energy-field">
            <span className="energy-icon">🔋</span>
            <span className="energy-level">85%</span>
          </div>
        </div>
      </header>

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
        ) : (
          <div className="placeholder-card">
            <h2>
              {activePage === 'analytics'
                ? 'Analytics'
                : activePage === 'tracker'
                  ? 'Tracker'
                  : 'Resources'}
            </h2>
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
    </div>
  );
}

export default App;
