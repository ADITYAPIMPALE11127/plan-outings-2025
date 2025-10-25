import React, { useState } from 'react';
import AddFriend from './AddFriend';
import FriendsList from './FriendsList';
import type { Friend } from '../types/Friend';
import './styles.css';

interface FriendManagementProps {
  onFriendSelected?: (friend: Friend) => void;
}

type FriendManagementTab = 'add' | 'list';

const FriendManagement: React.FC<FriendManagementProps> = ({ onFriendSelected }) => {
  const [activeTab, setActiveTab] = useState<FriendManagementTab>('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFriendAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // Switch to list tab after adding a friend
    setActiveTab('list');
  };

  const handleFriendSelected = (friend: Friend) => {
    onFriendSelected?.(friend);
  };

  return (
    <div className="friend-management-container">
      <div className="friend-management-header">
        <h1 className="friend-management-title">Manage Friends</h1>
        <p className="friend-management-subtitle">
          Add new friends and manage your existing connections
        </p>
      </div>

      <div className="friend-management-tabs">
        <button
          className={`friend-management-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <span className="friend-management-tab-icon">➕</span>
          Add Friend
        </button>
        <button
          className={`friend-management-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <span className="friend-management-tab-icon">👥</span>
          My Friends
        </button>
      </div>

      <div className="friend-management-content">
        {activeTab === 'add' && (
          <AddFriend onFriendAdded={handleFriendAdded} />
        )}
        {activeTab === 'list' && (
          <FriendsList 
            key={refreshTrigger}
            onFriendSelected={handleFriendSelected}
          />
        )}
      </div>
    </div>
  );
};

export default FriendManagement;
