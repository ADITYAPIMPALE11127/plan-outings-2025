import React, { useState, useEffect } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { db } from '../firebaseConfig';
import './styles.css';

interface Notification {
  id: string;
  type: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsProps {
  currentUser: any;
  onGroupSelect: (groupId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ currentUser, onGroupSelect }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = ref(db, `notifications/${currentUser.uid}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userNotifications: Notification[] = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setNotifications(userNotifications);
      } else {
        setNotifications([]);
      }
    });

    return () => {
      off(notificationsRef, 'value', unsubscribe);
    };
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    
    try {
      await set(ref(db, `notifications/${currentUser.uid}/${notificationId}/read`), true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.groupId) {
      onGroupSelect(notification.groupId);
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-container">
      <button 
        className="notifications-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'notification-unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;