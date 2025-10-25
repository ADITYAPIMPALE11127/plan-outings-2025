import React from 'react';
import './styles.css';

interface Group {
  id: string;
  name: string;
  description: string;
  admin: string;
  members: string[];
  createdAt: string;
}

interface GroupListProps {
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
  currentUser: any;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onSelectGroup, currentUser }) => {
  if (groups.length === 0) {
    return (
      <div className="groups-empty-state">
        <div className="empty-icon">👥</div>
        <h3>No Groups Yet</h3>
        <p>Create your first group to start planning outings with friends!</p>
        <p className="empty-subtext">
          You'll see groups here when you create them or when you're added by other users.
        </p>
      </div>
    );
  }

  return (
    <div className="groups-list">
      <h3 className="groups-list-title">Your Groups ({groups.length})</h3>
      <div className="groups-grid">
        {groups.map(group => (
          <div
            key={group.id}
            className="group-card"
            onClick={() => onSelectGroup(group.id)}
          >
            <div className="group-header">
              <h4 className="group-name">{group.name}</h4>
              <div className="group-badges">
                {group.admin === currentUser?.uid && (
                  <span className="admin-badge">Admin</span>
                )}
                {group.members.length > 0 && (
                  <span className="members-badge">
                    👥 {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </span>
                )}
              </div>
            </div>
            <p className="group-description">{group.description}</p>
            <div className="group-meta">
              <span className="group-created">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </span>
              <span className="group-role">
                {group.admin === currentUser?.uid ? 'You are admin' : 'Member'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;