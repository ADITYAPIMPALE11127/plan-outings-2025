// src/components/types.ts

export interface User {
    uid: string;
    email: string;
    fullName: string;
    username?: string;
    location?: string;
    preferences?: string[];
}

export interface Group {
    id: string;
    name: string;
    description: string;
    admin: string;
    members: string[];
    createdAt: string;
}

export interface Message {
    id: string;
    text: string;
    userId: string;
    userName: string;
    timestamp: string;
    groupId: string;
}