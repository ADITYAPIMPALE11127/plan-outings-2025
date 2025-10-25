import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import './styles.css';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
  position?: 'top' | 'bottom';
}

const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({ 
  onEmojiClick, 
  position = 'top' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData.emoji);
    // Keep the picker open for multiple emoji selections
    // setIsOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsOpen(!isOpen);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate position for the emoji picker
  const getPickerPosition = () => {
    if (position === 'top') {
      return {
        bottom: '100%',
        right: 0,
        marginBottom: '8px'
      };
    } else {
      return {
        top: '100%',
        right: 0,
        marginTop: '8px'
      };
    }
  };

  return (
    <div className="emoji-picker-container">
      <button
        ref={emojiButtonRef}
        type="button"
        onClick={toggleEmojiPicker}
        className="emoji-picker-button"
        title="Add emoji"
      >
        <span className="emoji-icon">😊</span>
      </button>

      {isOpen && (
        <div 
          ref={emojiPickerRef}
          className="emoji-picker-dropdown"
          style={getPickerPosition()}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            height={400}
            width={350}
            skinTonesDisabled
            searchDisabled={false}
            previewConfig={{
              showPreview: true,
              defaultEmoji: '1f60a',
              defaultCaption: "What's your mood?"
            }}
            lazyLoadEmojis={true}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;