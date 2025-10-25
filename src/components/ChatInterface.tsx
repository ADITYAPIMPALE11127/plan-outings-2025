import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
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

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
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
            placeholder="Suggest an outing idea..."
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
    </div>
  );
};

export default ChatInterface;
