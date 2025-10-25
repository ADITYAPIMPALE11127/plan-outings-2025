// src/services/toastNotificationsService.ts
import { ref, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';

interface NotificationListenerProps {
  currentUser: any;
  currentGroupId?: string;
}

interface Message {
  userId: string;
  userName: string;
  text?: string;
  type?: 'text' | 'poll';
  poll?: {
    question: string;
  };
  timestamp: string;
}

export const setupMessageNotifications = ({
  currentUser,
  currentGroupId
}: NotificationListenerProps): (() => void) => {
  if (!currentUser) return () => {};

  // Listen to all groups the user is part of, or just the current group
  const groupsRef = currentGroupId 
    ? ref(db, `groupMessages/${currentGroupId}`)
    : ref(db, 'groupMessages');

  const unsubscribe = onValue(groupsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    Object.keys(data).forEach(groupId => {
      const groupMessages = data[groupId];
      if (typeof groupMessages === 'object') {
        const messageKeys = Object.keys(groupMessages);
        const latestMessageKey = messageKeys[messageKeys.length - 1];
        const latestMessage: Message = groupMessages[latestMessageKey];

        // Check if this is a new message (within last 10 seconds)
        const messageTime = new Date(latestMessage.timestamp).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - messageTime < 10000 && // Within last 10 seconds
            latestMessage.userId !== currentUser.uid) { // Not from current user
          
          showToastNotification(latestMessage, groupId);
        }
      }
    });
  });

  return unsubscribe;
};

const showToastNotification = (message: Message, groupId: string) => {
  const isPoll = message.type === 'poll';
  
  if (isPoll && message.poll) {
    // For poll notifications - use plain text
    toast.info(
      `📊 ${message.userName} created a poll: "${message.poll.question}"`,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  } else if (message.text) {
    // For text message notifications - use plain text
    toast.info(
      `💬 ${message.userName} in ${groupId}: ${message.text}`,
      {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }
};

// For specific group notifications
export const setupGroupMessageNotifications = (currentUser: any, groupId: string) => {
  return setupMessageNotifications({ currentUser, currentGroupId: groupId });
};

// For all groups notifications
export const setupAllMessageNotifications = (currentUser: any) => {
  return setupMessageNotifications({ currentUser });
};