import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../firebaseConfig';
import './styles.css';

interface PollOption {
  text: string;
  votes: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  totalVotes: number;
}

interface PollMessageProps {
  poll: Poll | null;
  currentUser: any;
  messageId: string;
  groupId: string;
}

const PollMessage: React.FC<PollMessageProps> = ({
  poll,
  currentUser,
  messageId,
  groupId,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [localPoll, setLocalPoll] = useState<Poll | null>(poll);

  useEffect(() => {
    if (!poll) return;

    setLocalPoll(poll);
    
    // Check if user has already voted
    const userVotedOption = poll.options?.findIndex(option =>
      option.votes?.includes(currentUser?.uid)
    ) ?? -1;
    
    if (userVotedOption !== -1) {
      setSelectedOption(userVotedOption);
      setHasVoted(true);
    }
  }, [poll, currentUser]);

  const handleVote = async (optionIndex: number) => {
    if (!currentUser || hasVoted || !localPoll) return;

    try {
      const pollRef = ref(db, `groupMessages/${groupId}/${messageId}/poll`);
      
      // Create updated options array with proper null checks
      const updatedOptions = localPoll.options?.map((option, index) => {
        if (index === optionIndex) {
          return {
            ...option,
            votes: [...(option.votes || []), currentUser.uid]
          };
        }
        return option;
      }) || [];

      const updatedPoll = {
        ...localPoll,
        options: updatedOptions,
        totalVotes: (localPoll.totalVotes || 0) + 1
      };

      await set(pollRef, updatedPoll);
      setLocalPoll(updatedPoll);
      setSelectedOption(optionIndex);
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleChangeVote = async (optionIndex: number) => {
    if (!currentUser || selectedOption === null || !localPoll) return;

    try {
      const pollRef = ref(db, `groupMessages/${groupId}/${messageId}/poll`);
      
      // Remove vote from previously selected option
      const updatedOptions = localPoll.options?.map((option, index) => {
        if (index === selectedOption) {
          return {
            ...option,
            votes: (option.votes || []).filter(uid => uid !== currentUser.uid)
          };
        }
        if (index === optionIndex) {
          return {
            ...option,
            votes: [...(option.votes || []), currentUser.uid]
          };
        }
        return option;
      }) || [];

      const updatedPoll = {
        ...localPoll,
        options: updatedOptions
      };

      await set(pollRef, updatedPoll);
      setLocalPoll(updatedPoll);
      setSelectedOption(optionIndex);
    } catch (error) {
      console.error('Error changing vote:', error);
    }
  };

  const getPercentage = (votes: number) => {
    const totalVotes = localPoll?.totalVotes || 0;
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getUserInitial = (userId: string) => {
    return userId?.charAt(0)?.toUpperCase() || '?';
  };

  // Safe array access with fallbacks
  const safeOptions = localPoll?.options || [];
  const totalVotes = localPoll?.totalVotes || 0;
  const question = localPoll?.question || 'Poll question';

  // Calculate winning option safely
  const getWinningOptionIndex = () => {
    if (safeOptions.length === 0) return -1;
    const voteCounts = safeOptions.map(opt => opt.votes?.length || 0);
    const maxVotes = Math.max(...voteCounts);
    return voteCounts.indexOf(maxVotes);
  };

  const winningOptionIndex = getWinningOptionIndex();

  // Show loading state if poll data is not available
  if (!localPoll) {
    return (
      <div className="poll-message loading">
        <div className="poll-header">
          <div className="poll-icon">📊</div>
          <div className="poll-title">Poll</div>
        </div>
        <div className="poll-question">Loading poll...</div>
      </div>
    );
  }

  return (
    <div className="poll-message">
      <div className="poll-header">
        <div className="poll-icon">📊</div>
        <div className="poll-title">Poll</div>
      </div>
      
      <div className="poll-question">{question}</div>
      
      <div className="poll-options">
        {safeOptions.map((option, index) => {
          const isSelected = selectedOption === index;
          const voteCount = option.votes?.length || 0;
          const percentage = getPercentage(voteCount);
          const isWinning = index === winningOptionIndex && voteCount > 0;

          return (
            <div
              key={index}
              className={`poll-option ${isSelected ? 'selected' : ''} ${isWinning ? 'winning' : ''}`}
              onClick={() => hasVoted ? handleChangeVote(index) : handleVote(index)}
            >
              <div className="option-content">
                <div className="option-radio">
                  <div className={`radio-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <div className="radio-dot"></div>}
                  </div>
                </div>
                <div className="option-text">{option.text || `Option ${index + 1}`}</div>
              </div>
              
              {hasVoted && (
                <div className="option-results">
                  <div className="result-bar">
                    <div 
                      className="result-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="result-stats">
                    <span className="percentage">{percentage}%</span>
                    <span className="vote-count">({voteCount})</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="poll-footer">
        <div className="voter-avatars">
          {safeOptions.flatMap(option => option.votes || [])
            .slice(0, 3)
            .map((userId, index) => (
              <div key={index} className="voter-avatar">
                {getUserInitial(userId)}
              </div>
            ))}
          {totalVotes > 3 && (
            <div className="more-voters">+{totalVotes - 3}</div>
          )}
        </div>
        <div className="poll-meta">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} • 
          {hasVoted ? ' Voted' : ' Vote now'}
        </div>
      </div>
    </div>
  );
};

export default PollMessage;