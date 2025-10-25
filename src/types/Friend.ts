export interface Friend {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  preferences?: string[];
  addedAt: Date;
  addedBy: string; // User ID who added this friend
  status: 'active' | 'pending' | 'blocked';
}

export interface AddFriendFormData {
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  preferences?: string[];
}

export interface FriendInvite {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}
