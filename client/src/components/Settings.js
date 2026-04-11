import React from 'react';
import './Settings.css';

export default function Settings({ onNavigateToProfile, onLogout }) {
  return (
    <div className="settings-card">
      <h2>Settings</h2>
      <div className="settings-buttons">
        <button className="btn btn-primary" onClick={onNavigateToProfile}>
          Update User Details
        </button>
        <button className="btn btn-secondary" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
