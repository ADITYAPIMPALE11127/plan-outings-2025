import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { UserProfile } from '../types/Social';
import Button from './Button';
import './styles.css';

interface UserDiscoveryProps {
  onFriendRequestSent?: () => void;
}

const UserDiscovery: React.FC<UserDiscoveryProps> = ({ onFriendRequestSent }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      
      // Get all public users except current user
      const usersQuery = query(
        collection(db, 'userProfiles'),
        where('isPublic', '==', true)
      );
      
      const snapshot = await getDocs(usersQuery);
      const usersList: UserProfile[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== auth.currentUser!.uid) {
          usersList.push({
            id: doc.id,
            email: data.email,
            fullName: data.fullName,
            displayName: data.displayName,
            bio: data.bio,
            location: data.location,
            preferences: data.preferences || [],
            profilePicture: data.profilePicture,
            isPublic: data.isPublic,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastActive: data.lastActive?.toDate()
          });
        }
      });

      // Get sent friend requests to avoid showing "Add Friend" for already requested users
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const sentRequestIds = new Set<string>();
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        sentRequestIds.add(data.toUserId);
      });

      setUsers(usersList);
      setSentRequests(sentRequestIds);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (user: UserProfile) => {
    if (!auth.currentUser) return;

    setLoadingRequests(prev => new Set(prev).add(user.id));

    try {
      // Check if request already exists
      const existingRequestQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', auth.currentUser.uid),
        where('toUserId', '==', user.id),
        where('status', '==', 'pending')
      );
      
      const existingSnapshot = await getDocs(existingRequestQuery);
      if (!existingSnapshot.empty) {
        toast.info('Friend request already sent');
        return;
      }

      // Get current user data
      const currentUserDoc = doc(db, 'userProfiles', auth.currentUser.uid);
      const currentUserData = await getDoc(currentUserDoc);

      // Create friend request
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: auth.currentUser.uid,
        fromUserName: currentUserData.data()?.fullName || auth.currentUser.email,
        fromUserEmail: auth.currentUser.email,
        toUserId: user.id,
        toUserName: user.fullName,
        toUserEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSentRequests(prev => new Set(prev).add(user.id));
      toast.success(`Friend request sent to ${user.fullName}`);
      onFriendRequestSent?.();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setLoadingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.location?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="user-discovery-container">
        <div className="user-discovery-loading">Discovering users...</div>
      </div>
    );
  }

  return (
    <div className="user-discovery-container">
      <div className="user-discovery-header">
        <h2 className="user-discovery-title">Discover People</h2>
        <p className="user-discovery-subtitle">Find and connect with friends</p>
      </div>

      <div className="user-discovery-search">
        <input
          type="text"
          placeholder="Search by name, email, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="user-discovery-search-input"
        />
      </div>

      <div className="user-discovery-content">
        {filteredUsers.length === 0 ? (
          <div className="user-discovery-empty">
            <div className="user-discovery-empty-icon">🔍</div>
            <h3>No users found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'No public users available to discover'
              }
            </p>
          </div>
        ) : (
          <div className="user-discovery-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-discovery-card">
                <div className="user-discovery-card-header">
                  <div className="user-discovery-avatar">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.fullName}
                        className="user-discovery-avatar-img"
                      />
                    ) : (
                      <div className="user-discovery-avatar-placeholder">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="user-discovery-card-info">
                    <h3 className="user-discovery-card-name">
                      {user.displayName || user.fullName}
                    </h3>
                    <p className="user-discovery-card-email">{user.email}</p>
                    {user.location && (
                      <p className="user-discovery-card-location">📍 {user.location}</p>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <div className="user-discovery-card-bio">
                    <p>{user.bio}</p>
                  </div>
                )}

                {user.preferences && user.preferences.length > 0 && (
                  <div className="user-discovery-card-preferences">
                    <div className="user-discovery-card-preferences-label">Interests:</div>
                    <div className="user-discovery-card-preferences-tags">
                      {user.preferences.slice(0, 3).map((pref, index) => (
                        <span key={index} className="user-discovery-card-preference-tag">
                          {pref}
                        </span>
                      ))}
                      {user.preferences.length > 3 && (
                        <span className="user-discovery-card-preference-more">
                          +{user.preferences.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="user-discovery-card-actions">
                  {sentRequests.has(user.id) ? (
                    <div className="user-discovery-request-sent">
                      <span className="user-discovery-request-sent-icon">✓</span>
                      Request Sent
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleSendFriendRequest(user)}
                      disabled={loadingRequests.has(user.id)}
                    >
                      {loadingRequests.has(user.id) ? 'Sending...' : 'Add Friend'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiscovery;
