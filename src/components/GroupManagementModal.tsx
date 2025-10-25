import React, { useState, useEffect } from 'react';
import { ref, set, remove, onValue, off, push } from 'firebase/database'; // Add push import
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './styles.css';

interface User {
  uid: string;
  email: string;
  fullName: string;
  username?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  admin: string;
  members: string[];
  createdAt: string;
}

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  currentUser: any;
  onGroupUpdate: () => void;
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUser,
  onGroupUpdate,
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentMembers, setCurrentMembers] = useState<User[]>([]);

  // Fetch all users and current group members when modal opens
  useEffect(() => {
    if (!isOpen || !group) return;

    // Fetch all users
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList: User[] = Object.keys(data).map(key => ({
          uid: key,
          ...data[key]
        }));
        setAllUsers(usersList);
        
        // Set current members with user data
        const membersWithData = group.members
          .map(memberId => usersList.find(user => user.uid === memberId))
          .filter(Boolean) as User[];
        setCurrentMembers(membersWithData);
      }
    });

    return () => {
      off(usersRef, 'value', unsubscribeUsers);
    };
  }, [isOpen, group]);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
    }
    setIsEditing(false);
    setIsDeleting(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [group]);

  const handleSearchUsers = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Search through all users excluding current members
    const filteredUsers = allUsers.filter(user => 
      (user.username?.toLowerCase().includes(query.toLowerCase()) ||
       user.fullName.toLowerCase().includes(query.toLowerCase()) ||
       user.email.toLowerCase().includes(query.toLowerCase())) &&
      !group?.members.includes(user.uid) // Exclude current members
    );
    
    setSearchResults(filteredUsers);
    setIsSearching(false);
  };

  const handleAddMember = async (user: User) => {
    if (!group || !isAdmin) return;

    try {
      const groupRef = ref(db, `groups/${group.id}`);
      const updatedMembers = [...group.members, user.uid];
      
      await set(groupRef, {
        ...group,
        members: updatedMembers,
      });

      // Create notification for the added member
      const notificationsRef = ref(db, `notifications/${user.uid}`);
      const newNotificationRef = push(notificationsRef); // Use the imported push function
      await set(newNotificationRef, {
        type: 'group_invitation',
        groupId: group.id,
        groupName: group.name,
        invitedBy: currentUser?.uid,
        invitedByName: currentUser?.displayName || currentUser?.email || 'Group Admin',
        message: `You've been added to the group "${group.name}"`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      toast.success(`Added ${user.username || user.fullName} to the group!`);
      setSearchQuery('');
      setSearchResults([]);
      onGroupUpdate();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member to group');
    }
  };

  const handleRemoveMember = async (user: User) => {
    if (!group || !isAdmin) return;

    // Don't allow removing the admin
    if (user.uid === group.admin) {
      toast.error('Cannot remove the group admin');
      return;
    }

    try {
      const groupRef = ref(db, `groups/${group.id}`);
      const updatedMembers = group.members.filter(memberId => memberId !== user.uid);
      
      await set(groupRef, {
        ...group,
        members: updatedMembers,
      });

      toast.success(`Removed ${user.username || user.fullName} from the group`);
      onGroupUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member from group');
    }
  };

  const handleSaveChanges = async () => {
    if (!group || !groupName.trim() || !groupDescription.trim()) return;

    try {
      const groupRef = ref(db, `groups/${group.id}`);
      await set(groupRef, {
        ...group,
        name: groupName.trim(),
        description: groupDescription.trim(),
      });

      toast.success('Group updated successfully!');
      setIsEditing(false);
      onGroupUpdate();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;

    try {
      // Delete group data
      const groupRef = ref(db, `groups/${group.id}`);
      await remove(groupRef);

      // Delete group messages
      const messagesRef = ref(db, `groupMessages/${group.id}`);
      await remove(messagesRef);

      toast.success('Group deleted successfully!');
      onClose();
      onGroupUpdate();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handleCancelEdit = () => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
    }
    setIsEditing(false);
  };

  const resetForm = () => {
    setIsEditing(false);
    setIsDeleting(false);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen || !group) return null;

  const isAdmin = group.admin === currentUser?.uid;

  // Get display name for user
  const getUserDisplayName = (user: User) => {
    return user.username ? `@${user.username}` : user.fullName;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Group</h2>
          <button className="modal-close" onClick={resetForm}>×</button>
        </div>

        <div className="group-management-content">
          {/* Group Information Section */}
          <div className="management-section">
            <h3>Group Information</h3>
            
            <div className="form-group">
              <label htmlFor="manageGroupName">Group Name</label>
              <input
                id="manageGroupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={!isEditing || !isAdmin}
                placeholder="Enter group name"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="manageGroupDescription">Group Description</label>
              <textarea
                id="manageGroupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                disabled={!isEditing || !isAdmin}
                placeholder="Describe the purpose of this group"
                maxLength={200}
                rows={3}
              />
            </div>

            {isAdmin && (
              <div className="edit-actions">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    Edit Information
                  </button>
                ) : (
                  <div className="edit-buttons">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      className="btn-primary"
                      disabled={!groupName.trim() || !groupDescription.trim()}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Group Members Management Section - Only for Admin */}
          {isAdmin && (
            <div className="management-section">
              <h3>Manage Members</h3>
              
              {/* Add New Members */}
              <div className="form-group">
                <label>Add New Members</label>
                <div className="member-search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="Search users by username, name, or email"
                    disabled={!isAdmin}
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
              </div>

              {/* Current Members List */}
              <div className="current-members">
                <h4>Current Members ({currentMembers.length})</h4>
                <div className="members-list">
                  {currentMembers.map(member => (
                    <div 
                      key={member.uid} 
                      className={`member-tag ${
                        member.uid === group.admin ? 'member-tag-admin' : ''
                      } ${member.uid === currentUser?.uid ? 'member-tag-current' : ''}`}
                    >
                      <span>
                        {getUserDisplayName(member)}
                        {member.uid === group.admin && ' (Admin)'}
                        {member.uid === currentUser?.uid && ' (You)'}
                      </span>
                      {member.uid !== group.admin && member.uid !== currentUser?.uid && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
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
            </div>
          )}

          {/* Group Statistics Section */}
          <div className="management-section">
            <h3>Group Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Members</span>
                <span className="stat-value">{group.members.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Created On</span>
                <span className="stat-value">
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Your Role</span>
                <span className="stat-value">
                  {isAdmin ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone - Only for Admin */}
          {isAdmin && (
            <div className="management-section danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-content">
                <div className="danger-warning">
                  <strong>Delete this group</strong>
                  <p>
                    Once you delete a group, there is no going back. This will
                    permanently delete the group and all its messages.
                  </p>
                </div>
                
                {!isDeleting ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="btn-danger"
                  >
                    Delete Group
                  </button>
                ) : (
                  <div className="delete-confirmation">
                    <p>Are you sure you want to delete this group?</p>
                    <div className="delete-buttons">
                      <button
                        type="button"
                        onClick={handleDeleteGroup}
                        className="btn-danger"
                      >
                        Yes, Delete Group
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeleting(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* For Non-Admin Users */}
          {!isAdmin && (
            <div className="management-section">
              <h3>Group Members</h3>
              <div className="members-list">
                {currentMembers.map(member => (
                  <div 
                    key={member.uid} 
                    className={`member-tag ${
                      member.uid === group.admin ? 'member-tag-admin' : ''
                    } ${member.uid === currentUser?.uid ? 'member-tag-current' : ''}`}
                  >
                    <span>
                      {getUserDisplayName(member)}
                      {member.uid === group.admin && ' (Admin)'}
                      {member.uid === currentUser?.uid && ' (You)'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="non-admin-message">
                <p>
                  Only group administrators can add or remove members. 
                  Please contact the group admin if you want to add someone.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={resetForm} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManagementModal;