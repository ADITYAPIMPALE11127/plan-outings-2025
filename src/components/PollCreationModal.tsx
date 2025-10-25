import React, { useState } from 'react';
import './styles.css';

interface PollCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (pollData: {
    question: string;
    options: string[];
  }) => void;
  userData: any; // Removed currentUser since it's not used
}

const PollCreationModal: React.FC<PollCreationModalProps> = ({
  isOpen,
  onClose,
  onCreatePoll,
  userData,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || options.some(opt => !opt.trim()) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCreatePoll({
        question: question.trim(),
        options: options.map(opt => opt.trim()).filter(opt => opt.length > 0),
      });

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error creating poll:', error);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    onClose();
  };

  const getUserInitial = () => {
    return userData?.fullName?.charAt(0)?.toUpperCase() || 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content poll-modal">
        <div className="modal-header">
          <h2>Create Poll</h2>
          <button className="modal-close" onClick={resetForm}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="poll-creation-form">
          {/* User Info */}
          <div className="poll-user-info">
            <div className="user-avatar">
              {getUserInitial()}
            </div>
            <div className="user-details">
              <div className="user-name">{userData?.fullName || 'User'}</div>
              <div className="poll-info">Poll • Everyone can vote</div>
            </div>
          </div>

          {/* Poll Question */}
          <div className="form-group">
            <label htmlFor="pollQuestion">Question *</label>
            <textarea
              id="pollQuestion"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              required
              maxLength={200}
              rows={2}
            />
            <div className="character-count">{question.length}/200</div>
          </div>

          {/* Poll Options */}
          <div className="form-group">
            <label>Options *</label>
            <div className="poll-options">
              {options.map((option, index) => (
                <div key={index} className="poll-option-input">
                  <div className="option-radio-preview">
                    <div className="radio-preview"></div>
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="remove-option-btn"
                      title="Remove option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="add-option-btn"
              >
                + Add Option
              </button>
            )}
            
            <div className="options-count">
              {options.length}/10 options
            </div>
          </div>

          {/* Preview Section */}
          {question.trim() && (
            <div className="poll-preview">
              <h4>Preview</h4>
              <div className="preview-poll">
                <div className="preview-question">{question}</div>
                <div className="preview-options">
                  {options.filter(opt => opt.trim()).map((option, index) => (
                    <div key={index} className="preview-option">
                      <div className="preview-radio"></div>
                      <span>{option || `Option ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
                <div className="preview-footer">
                  <span className="vote-count">0 votes</span>
                  <span className="poll-type">Multiple options • Results visible</span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={
                !question.trim() || 
                options.filter(opt => opt.trim()).length < 2 ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PollCreationModal;