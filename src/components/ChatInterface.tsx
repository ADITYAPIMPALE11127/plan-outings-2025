import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { ref, onValue, off, set, push } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import GroupCreationModal from './GroupCreationModal';
import GroupList from './GroupList';
import GroupChat from './GroupChat';
import './styles.css';

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  username?: string;
  location?: string;
  preferences?: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  admin: string;
  members: string[];
  createdAt: string;
}

interface ChatInterfaceProps {
  onLogout?: () => void;
}

type ViewMode = 'groups' | 'group-chat';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('groups');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userRef = ref(db, 'users/' + currentUser.uid);
          onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setUserData({
                uid: currentUser.uid,
                ...data
              });
            }
            setLoading(false);
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const groupsRef = ref(db, 'groups');
    
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userGroups: Group[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(group => group.members.includes(currentUser.uid))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setGroups(userGroups);
      } else {
        setGroups([]);
      }
    });

    return () => {
      off(groupsRef, 'value', unsubscribe);
    };
  }, [currentUser, refreshTrigger]); // Add refreshTrigger to dependencies

  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    members: string[];
  }) => {
    if (!currentUser) return;

    try {
      const groupsRef = ref(db, 'groups');
      const newGroupRef = push(groupsRef);
      
      const newGroup = {
        name: groupData.name,
        description: groupData.description,
        admin: currentUser.uid,
        members: groupData.members, // Already includes admin + selected members
        createdAt: new Date().toISOString(),
      };

      await set(newGroupRef, newGroup);

      // Create notifications for added members (excluding admin)
      const membersToNotify = groupData.members.filter(memberId => memberId !== currentUser.uid);
      
      for (const memberId of membersToNotify) {
        const notificationRef = push(ref(db, `notifications/${memberId}`));
        await set(notificationRef, {
          type: 'group_invitation',
          groupId: newGroupRef.key,
          groupName: groupData.name,
          invitedBy: currentUser.uid,
          invitedByName: userData?.fullName || 'Someone',
          message: `You've been added to the group "${groupData.name}"`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
      
      toast.success(`Group "${groupData.name}" created successfully!`);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleGroupUpdate = () => {
    // Trigger refresh of groups list
    setRefreshTrigger(prev => prev + 1);
    // If we're in group chat view and the group was deleted, go back to groups
    if (viewMode === 'group-chat') {
      const groupStillExists = groups.some(g => g.id === selectedGroup?.id);
      if (!groupStillExists) {
        setSelectedGroup(null);
        setViewMode('groups');
      }
    }
  };

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setViewMode('group-chat');
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setViewMode('groups');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-header-left">
            <h1 className="chat-title">Group Outing Planner</h1>
            <p className="chat-subtitle">
              {viewMode === 'groups' ? 'Manage your groups' : selectedGroup?.name}
            </p>
          </div>
          <div className="chat-header-right">
            <div className="chat-user-info">
              <span className="chat-user-name">
                {userData?.fullName || 'User'}
                {userData?.username && ` @${userData.username}`}
              </span>
              {userData?.location && (
                <span className="chat-user-location">{userData.location}</span>
              )}
            </div>
            <button onClick={handleLogout} className="chat-logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="chat-main-content">
        {viewMode === 'groups' && (
          <div className="groups-view">
            <div className="groups-header">
              <h2>Your Groups</h2>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="create-group-btn"
              >
                + Create New Group
              </button>
            </div>
            
            <GroupList
              groups={groups}
              onSelectGroup={handleSelectGroup}
              currentUser={currentUser}
            />
          </div>
        )}

        {viewMode === 'group-chat' && selectedGroup && (
          <GroupChat
            group={selectedGroup}
            currentUser={currentUser}
            userData={userData}
            onBack={handleBackToGroups}
            onGroupUpdate={handleGroupUpdate}
          />
        )}
      </div>

      {/* Group Creation Modal */}
      <GroupCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        currentUser={currentUser}
        userData={userData}
      />
    </div>
  );
};

export default ChatInterface;