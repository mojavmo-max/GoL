import React, { useEffect, useState } from 'react';
import { getProfile } from '../api/api';
import './Settings.css';

export default function Settings({ user, onNavigateToProfile, onLogout }) {
  const [selectedAvatar, setSelectedAvatar] = useState('🧍🏼‍♂️');
  const [profileDetails, setProfileDetails] = useState(null);

  const avatars = ['🧍🏼‍♂️', '🧍🏼'];

  const handleAvatarSwitch = (avatar) => {
    setSelectedAvatar(avatar);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await getProfile(user.id);
        if (isMounted) {
          setProfileDetails(data);
        }
      } catch (error) {
        if (isMounted) {
          setProfileDetails(null);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const ageValue = profileDetails?.age ?? user?.age;
  const relationshipValue =
    profileDetails?.relationshipStatus ?? user?.relationshipStatus;

  return (
    <div className="settings-container">
      <div className="settings-box">
        {/* Top Row */}
        <div className="settings-top">
          <button className="user-header-btn" onClick={onNavigateToProfile}>
            <div className="user-text-block">
              <h2 className="user-name">{user.firstName}</h2>
              <p className="user-detail">{ageValue || 'Age not set'}</p>
              <p className="user-detail">
                {relationshipValue || 'Relationship status not set'}
              </p>
            </div>
            <span className="nav-arrow">{'>'}</span>
          </button>
        </div>

        {/* Center Avatar */}
        <div className="avatar-center">
          <div className="avatar-container">
            <button className="avatar-button" title="Avatar Settings">
              <div className="full-body-avatar">{selectedAvatar}</div>
            </button>
            {avatars.map((avatar) => (
              avatar !== selectedAvatar && (
                <button
                  key={avatar}
                  className="avatar-button-small"
                  onClick={() => handleAvatarSwitch(avatar)}
                  title="Switch Avatar"
                >
                  <div className="small-body-avatar">{avatar}</div>
                </button>
              )
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="settings-bottom">
          <button className="settings-action-btn" onClick={onLogout} title="Log Out">
            <span className="left-arrow">‹</span>
            <span className="logout-text">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
