import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './styles.css';

interface User {
  uid: string;
  email: string;
  fullName: string;
  username?: string;
}

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: {
    name: string;
    description: string;
    members: string[];
  }) => void;
  currentUser: any;
  userData: User | null;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  currentUser,
  userData,
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Fetch all users from Firebase when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList: User[] = Object.keys(data).map(key => ({
          uid: key,
          ...data[key]
        })).filter(user => user.uid !== currentUser?.uid); // Exclude current user
        
        setAllUsers(usersList);
      } else {
        setAllUsers([]);
      }
    });

    return () => {
      off(usersRef, 'value', unsubscribe);
    };
  }, [isOpen, currentUser]);

  // Add admin (current user) to selected members by default
  useEffect(() => {
    if (currentUser && userData && isOpen) {
      const adminUser: User = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        fullName: userData.fullName,
        username: userData.username,
      };
      setSelectedMembers([adminUser]);
    }
  }, [currentUser, userData, isOpen]);

  const handleSearchUsers = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Search through all users in real-time
    const filteredUsers = allUsers.filter(user => 
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filteredUsers);
    setIsSearching(false);
  };

  const handleAddMember = (user: User) => {
    if (!selectedMembers.some(member => member.uid === user.uid)) {
      setSelectedMembers(prev => [...prev, user]);
      toast.success(`Added ${user.username || user.fullName} to group`);
    } else {
      toast.info(`${user.username || user.fullName} is already in the group`);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (userId: string) => {
    // Don't allow removing the admin (current user)
    if (userId === currentUser?.uid) return;
    
    const memberToRemove = selectedMembers.find(member => member.uid === userId);
    setSelectedMembers(prev => prev.filter(member => member.uid !== userId));
    
    if (memberToRemove) {
      toast.info(`Removed ${memberToRemove.username || memberToRemove.fullName} from group`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupDescription.trim()) return;

    // Extract just the UIDs for group creation
    const memberUids = selectedMembers.map(member => member.uid);

    onCreateGroup({
      name: groupName.trim(),
      description: groupDescription.trim(),
      members: memberUids,
    });

    // Reset form (but keep admin in selected members)
    setGroupName('');
    setGroupDescription('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSearchQuery('');
    setSearchResults([]);
    // Keep only admin in selected members when closing
    if (currentUser && userData) {
      const adminUser: User = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        fullName: userData.fullName,
        username: userData.username,
      };
      setSelectedMembers([adminUser]);
    }
    onClose();
  };

  // Get display name for user
  const getUserDisplayName = (user: User) => {
    return user.username ? `@${user.username}` : user.fullName;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="modal-close" onClick={resetForm}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="group-creation-form">
          <div className="form-group">
            <label htmlFor="groupName">Group Name *</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="groupDescription">Group Description *</label>
            <textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Describe the purpose of this group"
              required
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Add Members</label>
            <div className="member-search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Search users by username (e.g., @aditya_p_41, @Rohan_23) or name"
              />
              
              {isSearching && <div className="search-loading">Searching...</div>}
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div
                      key={user.uid}
                      className="search-result-item"
                      onClick={() => handleAddMember(user)}
                    >
                      <div className="user-info">
                        <span className="user-name">{user.fullName}</span>
                        <span className="user-email">{user.email}</span>
                        {user.username && (
                          <span className="user-username">@{user.username}</span>
                        )}
                      </div>
                      <button type="button" className="add-user-btn">+</button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
                <div className="no-results">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>

            <div className="selected-members">
              <h4>Group Members ({selectedMembers.length})</h4>
              <div className="members-list">
                {selectedMembers.map(member => (
                  <div 
                    key={member.uid} 
                    className={`member-tag ${
                      member.uid === currentUser?.uid ? 'member-tag-admin' : ''
                    }`}
                  >
                    <span>
                      {getUserDisplayName(member)}
                      {member.uid === currentUser?.uid && ' (You)'}
                    </span>
                    {member.uid !== currentUser?.uid && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.uid)}
                        className="remove-member-btn"
                        title={`Remove ${getUserDisplayName(member)}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="search-tips">
              <p><strong>Search tips:</strong></p>
              <ul>
                <li>Type username starting with @ (e.g., @aditya_p_41)</li>
                <li>Type full name (e.g., Aditya Patel)</li>
                <li>Type email address</li>
              </ul>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!groupName.trim() || !groupDescription.trim()}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreationModal;