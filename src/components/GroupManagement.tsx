import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, getDocs, serverTimestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { Group, GroupMember } from '../types/Social';
import type { Friend } from '../types/Friend';
import Button from './Button';
import FormInput from './FormInput';
import './styles.css';

interface GroupManagementProps {
  onGroupSelected?: (group: Group) => void;
}

type GroupTab = 'create' | 'my-groups' | 'invitations';

const GroupManagement: React.FC<GroupManagementProps> = ({ onGroupSelected }) => {
  const [activeTab, setActiveTab] = useState<GroupTab>('create');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Create group form
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Partial<typeof groupForm>>({});

  useEffect(() => {
    fetchMyGroups();
    fetchFriends();
  }, []);

  const fetchMyGroups = async () => {
    if (!auth.currentUser) return;

    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('createdBy', '==', auth.currentUser.uid)
      );

      const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
        const groupsList: Group[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          groupsList.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            members: data.members || [],
            isPublic: data.isPublic,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastActivity: data.lastActivity?.toDate(),
            groupPicture: data.groupPicture
          });
        });
        setMyGroups(groupsList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (!auth.currentUser) return;

    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('addedBy', '==', auth.currentUser.uid),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(friendsQuery);
      const friendsList: Friend[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        friendsList.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          location: data.location,
          preferences: data.preferences || [],
          addedAt: data.addedAt?.toDate() || new Date(),
          addedBy: data.addedBy,
          status: data.status
        });
      });
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<typeof groupForm> = {};

    if (!groupForm.name.trim()) {
      errors.name = 'Group name is required';
    } else if (groupForm.name.trim().length < 3) {
      errors.name = 'Group name must be at least 3 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !auth.currentUser) return;

    setCreatingGroup(true);
    try {
      // Get current user data
      const currentUserDoc = doc(db, 'userProfiles', auth.currentUser.uid);
      const currentUserData = await getDoc(currentUserDoc);
      const currentUserName = currentUserData.data()?.fullName || auth.currentUser.email;

      // Create group members array
      const members: GroupMember[] = [
        {
          userId: auth.currentUser.uid,
          userName: currentUserName,
          userEmail: auth.currentUser.email!,
          role: 'admin',
          joinedAt: new Date()
        }
      ];

      // Add selected friends as members
      for (const friendId of selectedFriends) {
        const friend = friends.find(f => f.id === friendId);
        if (friend) {
          members.push({
            userId: friend.id,
            userName: friend.name,
            userEmail: friend.email,
            role: 'member',
            joinedAt: new Date(),
            invitedBy: auth.currentUser.uid
          });
        }
      }

      // Create group
      await addDoc(collection(db, 'groups'), {
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        createdBy: auth.currentUser.uid,
        createdByName: currentUserName,
        members,
        isPublic: groupForm.isPublic,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      // Create chat room for the group
      await addDoc(collection(db, 'chatRooms'), {
        type: 'group',
        name: groupForm.name.trim(),
        participants: members.map(m => m.userId),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      toast.success(`Group "${groupForm.name}" created successfully!`);
      
      // Reset form
      setGroupForm({ name: '', description: '', isPublic: false });
      setSelectedFriends([]);
      setFormErrors({});
      
      // Switch to my groups tab
      setActiveTab('my-groups');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'groups', groupId));
        toast.success('Group deleted successfully');
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="group-management-container">
        <div className="group-management-loading">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="group-management-container">
      <div className="group-management-header">
        <h2 className="group-management-title">Manage Groups</h2>
        <p className="group-management-subtitle">Create and manage your outing groups</p>
      </div>

      <div className="group-management-tabs">
        <button
          className={`group-management-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className="group-management-tab-icon">➕</span>
          Create Group
        </button>
        <button
          className={`group-management-tab ${activeTab === 'my-groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-groups')}
        >
          <span className="group-management-tab-icon">👥</span>
          My Groups ({myGroups.length})
        </button>
      </div>

      <div className="group-management-content">
        {activeTab === 'create' && (
          <div className="group-create-container">
            <form onSubmit={handleCreateGroup} className="group-create-form">
              <div className="group-create-fields">
                <FormInput
                  name="groupName"
                  label="Group Name *"
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  error={formErrors.name}
                  placeholder="Enter group name"
                  required
                />

                <FormInput
                  name="description"
                  label="Description"
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What's this group about?"
                />

                <div className="group-create-privacy">
                  <label className="group-create-privacy-label">
                    <input
                      type="checkbox"
                      checked={groupForm.isPublic}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="group-create-privacy-checkbox"
                    />
                    <span className="group-create-privacy-text">
                      Make this group public (others can discover and join)
                    </span>
                  </label>
                </div>

                <div className="group-create-friends">
                  <label className="group-create-friends-label">
                    Invite Friends
                  </label>
                  <div className="group-create-friends-list">
                    {friends.length === 0 ? (
                      <p className="group-create-no-friends">
                        No friends available. Add some friends first!
                      </p>
                    ) : (
                      friends.map((friend) => (
                        <label key={friend.id} className="group-create-friend-item">
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(friend.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFriends(prev => [...prev, friend.id]);
                              } else {
                                setSelectedFriends(prev => prev.filter(id => id !== friend.id));
                              }
                            }}
                            className="group-create-friend-checkbox"
                          />
                          <span className="group-create-friend-name">{friend.name}</span>
                          <span className="group-create-friend-email">{friend.email}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="group-create-actions">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creatingGroup}
                >
                  {creatingGroup ? 'Creating Group...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'my-groups' && (
          <div className="group-list-container">
            {myGroups.length === 0 ? (
              <div className="group-list-empty">
                <div className="group-list-empty-icon">👥</div>
                <h3>No groups yet</h3>
                <p>Create your first group to start planning outings with friends</p>
              </div>
            ) : (
              <div className="group-list-grid">
                {myGroups.map((group) => (
                  <div key={group.id} className="group-list-item">
                    <div className="group-list-item-header">
                      <div className="group-list-item-info">
                        <h3 className="group-list-item-name">{group.name}</h3>
                        {group.description && (
                          <p className="group-list-item-description">{group.description}</p>
                        )}
                        <p className="group-list-item-members">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </p>
                        <p className="group-list-item-created">
                          Created {formatDate(group.createdAt)}
                        </p>
                      </div>
                      <div className="group-list-item-privacy">
                        {group.isPublic ? 'Public' : 'Private'}
                      </div>
                    </div>

                    <div className="group-list-item-members-list">
                      <div className="group-list-item-members-label">Members:</div>
                      <div className="group-list-item-members-avatars">
                        {group.members.slice(0, 5).map((member, index) => (
                          <div key={index} className="group-list-item-member-avatar">
                            {getInitials(member.userName)}
                          </div>
                        ))}
                        {group.members.length > 5 && (
                          <div className="group-list-item-member-more">
                            +{group.members.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="group-list-item-actions">
                      <Button
                        variant="primary"
                        onClick={() => onGroupSelected?.(group)}
                      >
                        Open Group
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;
