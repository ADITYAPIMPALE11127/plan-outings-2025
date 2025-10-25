import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import FriendManagement from './FriendManagement';
import UserDiscovery from './UserDiscovery';
import FriendRequests from './FriendRequests';
import GroupManagement from './GroupManagement';
import DirectMessage from './DirectMessage';
import type { Friend } from '../types/Friend';
import type { Group } from '../types/Social';
import './styles.css';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: any;
}

interface UserData {
  fullName: string;
  email: string;
  location?: string;
  preferences?: string[];
}

type ChatTab = 'chat' | 'friends' | 'discover' | 'requests' | 'groups';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        userId: currentUser.uid,
        userName: userData?.fullName || currentUser.email || 'Anonymous',
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
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

  const handleFriendSelected = (friend: Friend) => {
    setSelectedFriend(friend);
    setSelectedGroup(null);
    setShowDirectMessage(true);
    toast.success(`Opening chat with ${friend.name}!`);
  };

  const handleGroupSelected = (group: Group) => {
    setSelectedGroup(group);
    setSelectedFriend(null);
    setShowDirectMessage(false);
    setActiveTab('chat');
    toast.success(`Selected group "${group.name}" for planning!`);
  };

  const handleBackFromDirectMessage = () => {
    setShowDirectMessage(false);
    setSelectedFriend(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-header-left">
            <h1 className="chat-title">Group Outing Planner</h1>
            <p className="chat-subtitle">Plan your next adventure together</p>
          </div>
          <div className="chat-header-right">
            <div className="chat-user-info">
              <span className="chat-user-name">{userData?.fullName || 'User'}</span>
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

      <div className="chat-tabs">
        <button
          className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span className="chat-tab-icon">💬</span>
          Chat
        </button>
        <button
          className={`chat-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <span className="chat-tab-icon">👥</span>
          Friends
        </button>
        <button
          className={`chat-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <span className="chat-tab-icon">🔍</span>
          Discover
        </button>
        <button
          className={`chat-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span className="chat-tab-icon">📥</span>
          Requests
        </button>
        <button
          className={`chat-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <span className="chat-tab-icon">🏘️</span>
          Groups
        </button>
      </div>

      {activeTab === 'chat' && !showDirectMessage && (
        <>
          {selectedFriend && (
            <div className="chat-selected-friend">
              <span className="chat-selected-friend-label">Planning with:</span>
              <span className="chat-selected-friend-name">{selectedFriend.name}</span>
              <button
                onClick={() => setSelectedFriend(null)}
                className="chat-selected-friend-clear"
              >
                ✕
              </button>
            </div>
          )}

          {selectedGroup && (
            <div className="chat-selected-group">
              <span className="chat-selected-group-label">Group:</span>
              <span className="chat-selected-group-name">{selectedGroup.name}</span>
              <span className="chat-selected-group-members">
                {selectedGroup.members.length} members
              </span>
              <button
                onClick={() => setSelectedGroup(null)}
                className="chat-selected-group-clear"
              >
                ✕
              </button>
            </div>
          )}

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">💬</div>
                <h3>Start the conversation!</h3>
                <p>Be the first to suggest an outing idea</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.userId === currentUser?.uid ? 'chat-message-own' : 'chat-message-other'
                  }`}
                >
                  <div className="chat-message-content">
                    {message.userId !== currentUser?.uid && (
                      <div className="chat-message-author">{message.userName}</div>
                    )}
                    <div className="chat-message-text">{message.text}</div>
                    <div className="chat-message-time">
                      {message.timestamp?.toDate
                        ? new Date(message.timestamp.toDate()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Sending...'}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  selectedFriend 
                    ? `Suggest an outing with ${selectedFriend.name}...` 
                    : selectedGroup 
                    ? `Suggest an outing for ${selectedGroup.name}...`
                    : "Suggest an outing idea..."
                }
                className="chat-input"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="chat-send-button"
              >
                <span className="chat-send-icon">→</span>
              </button>
            </div>
          </form>
        </>
      )}

      {showDirectMessage && selectedFriend && (
        <DirectMessage 
          selectedFriend={selectedFriend} 
          onBack={handleBackFromDirectMessage}
        />
      )}

      {activeTab === 'friends' && (
        <FriendManagement onFriendSelected={handleFriendSelected} />
      )}

      {activeTab === 'discover' && (
        <UserDiscovery onFriendRequestSent={() => setActiveTab('requests')} />
      )}

      {activeTab === 'requests' && (
        <FriendRequests onRequestHandled={() => setActiveTab('friends')} />
      )}

      {activeTab === 'groups' && (
        <GroupManagement onGroupSelected={handleGroupSelected} />
      )}
    </div>
  );
};

export default ChatInterface;
