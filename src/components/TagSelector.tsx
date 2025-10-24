import React from 'react';
import './styles.css';

export interface TagSelectorProps {
  label: string;
  tags: string[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
  error?: string;
  required?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  tags,
  selectedTags,
  onChange,
  error,
  required = false,
}) => {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-selector-container">
      {/* Label with required indicator */}
      <label className="tag-selector-label">
        {label} {required && <span className="tag-selector-required">*</span>}
      </label>

      {/* Tags grid - responsive columns */}
      <div className="tag-selector-grid">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`
                tag-selector-button
                ${isSelected ? 'tag-selector-selected' : 'tag-selector-unselected'}
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Selected count indicator */}
      {selectedTags.length > 0 && (
        <p className="tag-selector-count">
          {selectedTags.length} preference{selectedTags.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Error message display */}
      {error && (
        <p className="tag-selector-error">{error}</p>
      )}
    </div>
  );
};

export default TagSelector;