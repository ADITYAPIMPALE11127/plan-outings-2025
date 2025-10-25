import React from 'react';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebaseConfig';
import './styles.css';

interface MessageReactionsProps {
    messageId: string;
    groupId: string;
    reactions: { [emoji: string]: string[] };
    currentUser: any;
}

const EMOJI_OPTIONS = ['👍', '👎', '❤️', '😂', '😮', '😢', '🔥', '👀'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
    messageId,
    groupId,
    reactions,
    currentUser
}) => {
    const handleReaction = async (emoji: string) => {
        if (!currentUser) return;

        try {
            const reactionsRef = ref(db, `groupMessages/${groupId}/${messageId}/reactions/${emoji}`);
            const snapshot = await get(reactionsRef);
            
            let currentReactions: string[] = [];
            if (snapshot.exists()) {
                currentReactions = snapshot.val() || [];
            }

            let newReactions: string[];
            if (currentReactions.includes(currentUser.uid)) {
                // Remove reaction if already exists
                newReactions = currentReactions.filter(uid => uid !== currentUser.uid);
            } else {
                // Add reaction
                newReactions = [...currentReactions, currentUser.uid];
            }

            // If no reactions left, remove the emoji entirely
            if (newReactions.length === 0) {
                await set(reactionsRef, null);
            } else {
                await set(reactionsRef, newReactions);
            }
        } catch (error) {
            console.error('Error updating reaction:', error);
        }
    };

    const getUserReaction = (emoji: string) => {
        return reactions && reactions[emoji] && reactions[emoji].includes(currentUser?.uid);
    };

    return (
        <div className="message-reactions">
            {EMOJI_OPTIONS.map(emoji => {
                const userReacted = getUserReaction(emoji);
                const reactionCount = reactions?.[emoji]?.length || 0;
                
                if (reactionCount === 0 && !userReacted) {
                    // Show all emoji options but with lower opacity when no reactions
                    return (
                        <button
                            key={emoji}
                            className="reaction-option"
                            onClick={() => handleReaction(emoji)}
                            title={`Add ${emoji} reaction`}
                        >
                            <span className="reaction-emoji">{emoji}</span>
                        </button>
                    );
                } else if (reactionCount > 0) {
                    // Show reaction with count
                    return (
                        <button
                            key={emoji}
                            className={`reaction ${userReacted ? 'reaction-user-reacted' : ''}`}
                            onClick={() => handleReaction(emoji)}
                            title={`${reactionCount} ${reactionCount === 1 ? 'reaction' : 'reactions'}`}
                        >
                            <span className="reaction-emoji">{emoji}</span>
                            <span className="reaction-count">{reactionCount}</span>
                        </button>
                    );
                }
                return null;
            }).filter(Boolean)}
        </div>
    );
};

export default MessageReactions;