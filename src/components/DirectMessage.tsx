import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, getDocs, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { Friend, Message, ChatRoom } from '../types/Social';
import './styles.css';

interface DirectMessageProps {
  selectedFriend: Friend;
  onBack: () => void;
}

const DirectMessage: React.FC<DirectMessageProps> = ({ selectedFriend, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    findOrCreateChatRoom();
  }, [selectedFriend]);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages();
    }
  }, [chatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findOrCreateChatRoom = async () => {
    if (!currentUser) return;

    try {
      // Look for existing direct message room
      const existingQuery = query(
        collection(db, 'chatRooms'),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(existingQuery);
      let foundRoom: ChatRoom | null = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const participants = data.participants || [];
        if (participants.includes(selectedFriend.id)) {
          foundRoom = {
            id: doc.id,
            type: 'direct',
            name: data.name,
            participants,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastMessage: data.lastMessage
          };
        }
      });

      if (foundRoom) {
        setChatRoom(foundRoom);
      } else {
        // Create new direct message room
        const roomRef = await addDoc(collection(db, 'chatRooms'), {
          type: 'direct',
          name: `Chat with ${selectedFriend.name}`,
          participants: [currentUser.uid, selectedFriend.id],
          createdBy: currentUser.uid,
          createdAt: serverTimestamp()
        });

        const newRoom: ChatRoom = {
          id: roomRef.id,
          type: 'direct',
          name: `Chat with ${selectedFriend.name}`,
          participants: [currentUser.uid, selectedFriend.id],
          createdBy: currentUser.uid,
          createdAt: new Date()
        };

        setChatRoom(newRoom);
      }
    } catch (error) {
      console.error('Error finding/creating chat room:', error);
      toast.error('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = () => {
    if (!chatRoom) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoom.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          chatRoomId: data.chatRoomId,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type || 'text',
          replyTo: data.replyTo
        });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser || !chatRoom) return;

    try {
      await addDoc(collection(db, 'messages'), {
        chatRoomId: chatRoom.id,
        text: newMessage.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'You',
        timestamp: serverTimestamp(),
        type: 'text'
      });

      // Update chat room's last message
      await updateDoc(doc(db, 'chatRooms', chatRoom.id), {
        lastMessage: {
          text: newMessage.trim(),
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email || 'You',
          timestamp: serverTimestamp()
        }
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="direct-message-container">
        <div className="direct-message-loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="direct-message-container">
      <div className="direct-message-header">
        <div className="direct-message-header-left">
          <button onClick={onBack} className="direct-message-back-button">
            <span className="direct-message-back-arrow">←</span>
          </button>
          <div className="direct-message-friend-info">
            <div className="direct-message-friend-avatar">
              {getInitials(selectedFriend.name)}
            </div>
            <div className="direct-message-friend-details">
              <h3 className="direct-message-friend-name">{selectedFriend.name}</h3>
              <p className="direct-message-friend-status">Online</p>
            </div>
          </div>
        </div>
        <div className="direct-message-header-right">
          <button className="direct-message-menu-button">
            <span className="direct-message-menu-icon">⋯</span>
          </button>
        </div>
      </div>

      <div className="direct-message-messages">
        {messages.length === 0 ? (
          <div className="direct-message-empty">
            <div className="direct-message-empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Send a message to {selectedFriend.name} to begin planning your outing!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`direct-message-message ${
                message.userId === currentUser?.uid ? 'direct-message-own' : 'direct-message-other'
              }`}
            >
              <div className="direct-message-message-content">
                {message.userId !== currentUser?.uid && (
                  <div className="direct-message-message-author">{message.userName}</div>
                )}
                <div className="direct-message-message-text">{message.text}</div>
                <div className="direct-message-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="direct-message-input-form">
        <div className="direct-message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedFriend.name}...`}
            className="direct-message-input"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="direct-message-send-button"
          >
            <span className="direct-message-send-icon">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectMessage;
