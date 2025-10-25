import React, { useState, useEffect } from 'react';
import { ref, set, remove } from 'firebase/database';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './styles.css';

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

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
    }
    setIsEditing(false);
    setIsDeleting(false);
  }, [group]);

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
    onClose();
  };

  if (!isOpen || !group) return null;

  const isAdmin = group.admin === currentUser?.uid;

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
              <h3>Group Options</h3>
              <div className="non-admin-message">
                <p>
                  Only group administrators can modify group information and settings.
                  Please contact the group admin if you need changes.
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