import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { FriendRequest } from '../types/Social';
import Button from './Button';
import './styles.css';

interface FriendRequestsProps {
  onRequestHandled?: () => void;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ onRequestHandled }) => {
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Listen to incoming requests
    const incomingQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );

    const incomingUnsubscribe = onSnapshot(incomingQuery, (snapshot) => {
      const requests: FriendRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserEmail: data.fromUserEmail,
          toUserId: data.toUserId,
          toUserName: data.toUserName,
          toUserEmail: data.toUserEmail,
          status: data.status,
          message: data.message,
          createdAt: data.createdAt?.toDate() || new Date(),
          respondedAt: data.respondedAt?.toDate()
        });
      });
      setIncomingRequests(requests);
    });

    // Listen to outgoing requests
    const outgoingQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );

    const outgoingUnsubscribe = onSnapshot(outgoingQuery, (snapshot) => {
      const requests: FriendRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserEmail: data.fromUserEmail,
          toUserId: data.toUserId,
          toUserName: data.toUserName,
          toUserEmail: data.toUserEmail,
          status: data.status,
          message: data.message,
          createdAt: data.createdAt?.toDate() || new Date(),
          respondedAt: data.respondedAt?.toDate()
        });
      });
      setOutgoingRequests(requests);
    });

    setLoading(false);

    return () => {
      incomingUnsubscribe();
      outgoingUnsubscribe();
    };
  }, []);

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!auth.currentUser) return;

    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      // Update request status
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'accepted',
        respondedAt: serverTimestamp()
      });

      // Add to friends collection for both users
      const currentUserDoc = doc(db, 'userProfiles', auth.currentUser.uid);
      const currentUserData = await getDoc(currentUserDoc);
      
      const friendUserDoc = doc(db, 'userProfiles', request.fromUserId);
      await getDoc(friendUserDoc);

      // Add friend to current user's friends list
      await addDoc(collection(db, 'friends'), {
        name: request.fromUserName,
        email: request.fromUserEmail,
        addedBy: auth.currentUser.uid,
        addedAt: serverTimestamp(),
        status: 'active',
        friendUserId: request.fromUserId
      });

      // Add current user to friend's friends list
      await addDoc(collection(db, 'friends'), {
        name: currentUserData.data()?.fullName || auth.currentUser.email,
        email: auth.currentUser.email,
        addedBy: request.fromUserId,
        addedAt: serverTimestamp(),
        status: 'active',
        friendUserId: auth.currentUser.uid
      });

      toast.success(`You are now friends with ${request.fromUserName}!`);
      onRequestHandled?.();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'declined',
        respondedAt: serverTimestamp()
      });

      toast.success('Friend request declined');
      onRequestHandled?.();
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleCancelRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'cancelled',
        respondedAt: serverTimestamp()
      });

      toast.success('Friend request cancelled');
      onRequestHandled?.();
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast.error('Failed to cancel friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="friend-requests-container">
        <div className="friend-requests-loading">Loading friend requests...</div>
      </div>
    );
  }

  return (
    <div className="friend-requests-container">
      <div className="friend-requests-header">
        <h2 className="friend-requests-title">Friend Requests</h2>
        <p className="friend-requests-subtitle">Manage your friend connections</p>
      </div>

      <div className="friend-requests-tabs">
        <button
          className={`friend-requests-tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          <span className="friend-requests-tab-icon">📥</span>
          Incoming ({incomingRequests.length})
        </button>
        <button
          className={`friend-requests-tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          <span className="friend-requests-tab-icon">📤</span>
          Sent ({outgoingRequests.length})
        </button>
      </div>

      <div className="friend-requests-content">
        {activeTab === 'incoming' && (
          <div className="friend-requests-list">
            {incomingRequests.length === 0 ? (
              <div className="friend-requests-empty">
                <div className="friend-requests-empty-icon">📭</div>
                <h3>No incoming requests</h3>
                <p>You don't have any pending friend requests</p>
              </div>
            ) : (
              incomingRequests.map((request) => (
                <div key={request.id} className="friend-request-card">
                  <div className="friend-request-card-header">
                    <div className="friend-request-avatar">
                      <div className="friend-request-avatar-placeholder">
                        {getInitials(request.fromUserName)}
                      </div>
                    </div>
                    <div className="friend-request-card-info">
                      <h3 className="friend-request-card-name">{request.fromUserName}</h3>
                      <p className="friend-request-card-email">{request.fromUserEmail}</p>
                      <p className="friend-request-card-time">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="friend-request-card-message">
                      <p>"{request.message}"</p>
                    </div>
                  )}

                  <div className="friend-request-card-actions">
                    <Button
                      variant="primary"
                      onClick={() => handleAcceptRequest(request)}
                      disabled={processingRequests.has(request.id)}
                    >
                      {processingRequests.has(request.id) ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineRequest(request)}
                      disabled={processingRequests.has(request.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className="friend-requests-list">
            {outgoingRequests.length === 0 ? (
              <div className="friend-requests-empty">
                <div className="friend-requests-empty-icon">📤</div>
                <h3>No sent requests</h3>
                <p>You haven't sent any friend requests yet</p>
              </div>
            ) : (
              outgoingRequests.map((request) => (
                <div key={request.id} className="friend-request-card">
                  <div className="friend-request-card-header">
                    <div className="friend-request-avatar">
                      <div className="friend-request-avatar-placeholder">
                        {getInitials(request.toUserName)}
                      </div>
                    </div>
                    <div className="friend-request-card-info">
                      <h3 className="friend-request-card-name">{request.toUserName}</h3>
                      <p className="friend-request-card-email">{request.toUserEmail}</p>
                      <p className="friend-request-card-time">
                        Sent {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="friend-request-card-message">
                      <p>"{request.message}"</p>
                    </div>
                  )}

                  <div className="friend-request-card-actions">
                    <div className="friend-request-pending-status">
                      <span className="friend-request-pending-icon">⏳</span>
                      Pending
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCancelRequest(request)}
                      disabled={processingRequests.has(request.id)}
                    >
                      {processingRequests.has(request.id) ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
