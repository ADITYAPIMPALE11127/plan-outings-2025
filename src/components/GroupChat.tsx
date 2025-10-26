import React, { useState, useEffect, useRef } from 'react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { db } from '../firebaseConfig';
import GroupManagementModal from './GroupManagementModal';
import EmojiPickerComponent from './EmojiPicker';
import PollCreationModal from './PollCreationModal';
import PollMessage from './PollMessage';
import MessageReactions from './MessageReactions';
import ImageAttachment from './ImageAttachment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';
import { setupGroupMessageNotifications } from '../services/toastNotificationsService'; 

interface Message {
    id: string;
    text: string;
    userId: string;
    userName: string;
    timestamp: string;
    groupId: string;
    type?: 'text' | 'poll' | 'image';
    poll?: any;
    imageUrl?: string;
    reactions?: {
        [emoji: string]: string[];
    };
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
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Setup real-time message notifications for this group
    useEffect(() => {
        if (!currentUser || !group.id) return;

        const unsubscribe = setupGroupMessageNotifications(currentUser, group.id);

        return () => {
            unsubscribe();
        };
    }, [currentUser, group.id]);

    useEffect(() => {
        const messagesRef = ref(db, `groupMessages/${group.id}`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const msgs: Message[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    reactions: data[key].reactions || {} // Ensure reactions exist
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

        if ((!newMessage.trim() && !selectedImage) || !currentUser) return;

        try {
            const messagesRef = ref(db, `groupMessages/${group.id}`);
            const newMessageRef = push(messagesRef);

            const messageData: any = {
                userId: currentUser.uid,
                userName: userData?.fullName || currentUser.email || 'Anonymous',
                timestamp: new Date().toISOString(),
                groupId: group.id,
                reactions: {}
            };

            if (selectedImage) {
                messageData.type = 'image';
                messageData.imageUrl = selectedImage;
                messageData.text = newMessage.trim() || '';
            } else {
                messageData.type = 'text';
                messageData.text = newMessage.trim();
            }

            await set(newMessageRef, messageData);

            toast.success('Message sent!', {
                position: "bottom-right",
                autoClose: 2000,
            });

            setNewMessage('');
            setSelectedImage(null);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleCreatePoll = async (pollData: {
        question: string;
        options: string[];
    }) => {
        if (!currentUser) return;

        try {
            const messagesRef = ref(db, `groupMessages/${group.id}`);
            const newMessageRef = push(messagesRef);

            const poll = {
                question: pollData.question,
                options: pollData.options.map(option => ({
                    text: option,
                    votes: []
                })),
                createdBy: currentUser.uid,
                createdAt: new Date().toISOString(),
                totalVotes: 0,
            };

            const messageData = {
                userId: currentUser.uid,
                userName: userData?.fullName || currentUser.email || 'Anonymous',
                timestamp: new Date().toISOString(),
                groupId: group.id,
                type: 'poll',
                poll: poll,
                reactions: {} // Initialize empty reactions for polls too
            };

            await set(newMessageRef, messageData);

            // Show success toast for poll creator
            toast.success('Poll created!', {
                position: "bottom-right",
                autoClose: 2000,
            });

            setIsPollModalOpen(false);
        } catch (error) {
            console.error('Error creating poll:', error);
            toast.error('Failed to create poll');
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        const input = document.querySelector('.chat-input') as HTMLInputElement;
        if (input) {
            input.focus();
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        toast.success('Image attached!', {
            position: "bottom-right",
            autoClose: 2000,
        });
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
    };

    const isAdmin = group.admin === currentUser?.uid;

    return (
        <div className="group-chat-container">
            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Group Management Modal */}
            <GroupManagementModal
                isOpen={isManagementModalOpen}
                onClose={() => setIsManagementModalOpen(false)}
                group={group}
                currentUser={currentUser}
                onGroupUpdate={onGroupUpdate}
            />

            {/* Poll Creation Modal */}
            <PollCreationModal
                isOpen={isPollModalOpen}
                onClose={() => setIsPollModalOpen(false)}
                onCreatePoll={handleCreatePoll}
                userData={userData}
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
                            className={`chat-message ${message.userId === currentUser?.uid ? 'chat-message-own' : 'chat-message-other'
                                }`}
                        >
                            <div className="chat-message-content">
                                {message.userId !== currentUser?.uid && (
                                    <div className="chat-message-author">{message.userName}</div>
                                )}

                                {message.type === 'poll' ? (
                                    <PollMessage
                                        poll={message.poll || null}
                                        currentUser={currentUser}
                                        messageId={message.id}
                                        groupId={group.id}
                                    />
                                ) : message.type === 'image' ? (
                                    <div className="chat-message-image-container">
                                        <img
                                            src={message.imageUrl}
                                            alt="Shared image"
                                            className="chat-message-image"
                                        />
                                        {message.text && (
                                            <div className="chat-message-text">{message.text}</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="chat-message-text">{message.text}</div>
                                )}

                                {/* Message Reactions - Add this component below message content */}
                                <MessageReactions
                                    messageId={message.id}
                                    groupId={group.id}
                                    reactions={message.reactions || {}}
                                    currentUser={currentUser}
                                />

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
                {selectedImage && (
                    <div className="image-preview-container">
                        <img src={selectedImage} alt="Preview" className="image-preview" />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="image-preview-remove"
                            title="Remove image"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={selectedImage ? "Add a caption..." : `Suggest an outing idea in ${group.name}...`}
                            className="chat-input"
                            maxLength={500}
                        />

                        <ImageAttachment onImageSelect={handleImageSelect} />

                        <button
                            type="button"
                            onClick={() => setIsPollModalOpen(true)}
                            className="poll-create-button"
                            title="Create poll"
                        >
                            <span className="poll-icon">📊</span>
                        </button>

                        <EmojiPickerComponent
                            onEmojiClick={handleEmojiClick}
                            position="top"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className="chat-send-button"
                    >
                        <span className="chat-send-icon">→</span>
                    </button>
                </div>

                {!selectedImage && (
                    <div className="character-counter">
                        {newMessage.length}/500
                    </div>
                )}
            </form>
        </div>
    );
};

export default GroupChat;