export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  bio?: string;
  location?: string;
  preferences?: string[];
  profilePicture?: string;
  isPublic: boolean;
  createdAt: Date;
  lastActive?: Date;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  preferences?: string[];
  addedAt: Date;
  addedBy: string;
  status: 'active' | 'pending' | 'blocked';
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  members: GroupMember[];
  isPublic: boolean;
  createdAt: Date;
  lastActivity?: Date;
  groupPicture?: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  invitedBy?: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name: string;
  participants: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
  lastMessage?: {
    text: string;
    userId: string;
    userName: string;
    timestamp: Date;
  };
}

export interface Message {
  id: string;
  chatRoomId: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: 'text' | 'system';
  replyTo?: string;
}
