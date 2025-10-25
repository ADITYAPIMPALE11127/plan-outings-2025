import React, { useState, useEffect, useRef } from 'react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { db } from '../firebaseConfig';
import GroupManagementModal from './GroupManagementModal';
import EmojiPickerComponent from './EmojiPicker'; // Updated import name
import './styles.css';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  groupId: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  admin: string;
  members: string[];
  createdAt: string;
}

interface GroupChatProps {
  group: Group;
  currentUser: any;
  userData: any;
  onBack: () => void;
  onGroupUpdate: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ 
  group, 
  currentUser, 
  userData, 
  onBack,
  onGroupUpdate 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = ref(db, `groupMessages/${group.id}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs: Message[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeA - timeB;
        });
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });

    return () => {
      off(messagesRef, 'value', unsubscribe);
    };
  }, [group.id]);

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
      const messagesRef = ref(db, `groupMessages/${group.id}`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        text: newMessage.trim(),
        userId: currentUser.uid,
        userName: userData?.fullName || currentUser.email || 'Anonymous',
        timestamp: new Date().toISOString(),
        groupId: group.id,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    // Focus back on input after emoji selection
    const input = document.querySelector('.chat-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const isAdmin = group.admin === currentUser?.uid;

  return (
    <div className="group-chat-container">
      {/* Group Management Modal */}
      <GroupManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        group={group}
        currentUser={currentUser}
        onGroupUpdate={onGroupUpdate}
      />

      <div className="group-chat-header">
        <button onClick={onBack} className="back-to-groups-btn">
          ← Back to Groups
        </button>
        <div className="group-chat-info">
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <div className="group-chat-meta">
            <span className="member-count">👥 {group.members.length} members</span>
            {isAdmin && <span className="admin-indicator">• You are admin</span>}
          </div>
        </div>
        <button 
          onClick={() => setIsManagementModalOpen(true)}
          className="manage-group-btn"
        >
          Manage Group
        </button>
      </div>

      <div className="group-chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3>Start the conversation!</h3>
            <p>Be the first to suggest an outing idea in this group</p>
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
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="group-chat-input-form">
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Suggest an outing idea in ${group.name}...`}
              className="chat-input"
              maxLength={500}
            />
            <EmojiPickerComponent 
              onEmojiClick={handleEmojiClick}
              position="top"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="chat-send-button"
          >
            <span className="chat-send-icon">→</span>
          </button>
        </div>
        
        {/* Character counter */}
        <div className="character-counter">
          {newMessage.length}/500
        </div>
      </form>
    </div>
  );
};

export default GroupChat;