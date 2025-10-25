import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { Friend } from '../types/Friend';
import Button from './Button';
import './styles.css';

interface FriendsListProps {
  onFriendSelected?: (friend: Friend) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ onFriendSelected }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'blocked'>('all');

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'friends'),
      where('addedBy', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
          status: data.status || 'active'
        });
      });
      
      // Sort by name
      friendsList.sort((a, b) => a.name.localeCompare(b.name));
      setFriends(friendsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (friendId: string, newStatus: Friend['status']) => {
    try {
      await updateDoc(doc(db, 'friends', friendId), {
        status: newStatus
      });
      toast.success(`Friend status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating friend status:', error);
      toast.error('Failed to update friend status');
    }
  };

  const handleDeleteFriend = async (friendId: string, friendName: string) => {
    if (window.confirm(`Are you sure you want to remove ${friendName} from your friends list?`)) {
      try {
        await deleteDoc(doc(db, 'friends', friendId));
        toast.success('Friend removed successfully');
      } catch (error) {
        console.error('Error deleting friend:', error);
        toast.error('Failed to remove friend');
      }
    }
  };

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || friend.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'blocked': return 'status-blocked';
      default: return 'status-active';
    }
  };

  if (loading) {
    return (
      <div className="friends-list-container">
        <div className="friends-list-loading">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="friends-list-container">
      <div className="friends-list-header">
        <h2 className="friends-list-title">My Friends</h2>
        <p className="friends-list-subtitle">
          {friends.length} friend{friends.length !== 1 ? 's' : ''} in your list
        </p>
      </div>

      <div className="friends-list-controls">
        <div className="friends-list-search">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="friends-list-search-input"
          />
        </div>
        
        <div className="friends-list-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="friends-list-filter-select"
          >
            <option value="all">All Friends</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="friends-list-content">
        {filteredFriends.length === 0 ? (
          <div className="friends-list-empty">
            <div className="friends-list-empty-icon">👥</div>
            <h3>No friends found</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first friend!'
              }
            </p>
          </div>
        ) : (
          <div className="friends-list-grid">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="friends-list-item">
                <div className="friends-list-item-header">
                  <div className="friends-list-item-info">
                    <h3 className="friends-list-item-name">{friend.name}</h3>
                    <p className="friends-list-item-email">{friend.email}</p>
                    {friend.location && (
                      <p className="friends-list-item-location">📍 {friend.location}</p>
                    )}
                  </div>
                  <div className={`friends-list-item-status ${getStatusColor(friend.status)}`}>
                    {friend.status}
                  </div>
                </div>

                {friend.phoneNumber && (
                  <div className="friends-list-item-phone">
                    📞 {friend.phoneNumber}
                  </div>
                )}

                {friend.preferences && friend.preferences.length > 0 && (
                  <div className="friends-list-item-preferences">
                    <div className="friends-list-item-preferences-label">Interests:</div>
                    <div className="friends-list-item-preferences-tags">
                      {friend.preferences.slice(0, 3).map((pref, index) => (
                        <span key={index} className="friends-list-item-preference-tag">
                          {pref}
                        </span>
                      ))}
                      {friend.preferences.length > 3 && (
                        <span className="friends-list-item-preference-more">
                          +{friend.preferences.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="friends-list-item-actions">
                  <select
                    value={friend.status}
                    onChange={(e) => handleStatusChange(friend.id, e.target.value as Friend['status'])}
                    className="friends-list-item-status-select"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    onClick={() => onFriendSelected?.(friend)}
                  >
                    Select
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteFriend(friend.id, friend.name)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
