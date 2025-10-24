import React from 'react';

/**
 * TagSelector Component
 *
 * A reusable component for selecting multiple tags from a predefined list
 *
 * @param label - Label for the tag selector
 * @param tags - Array of available tags to choose from
 * @param selectedTags - Array of currently selected tags
 * @param onChange - Handler function when selection changes
 * @param error - Error message to display (if any)
 * @param required - Whether at least one tag must be selected
 */

interface TagSelectorProps {
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
  /**
   * Toggle tag selection
   * If tag is already selected, remove it
   * If tag is not selected, add it
   */
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag from selection
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag to selection
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="mb-4 sm:mb-5">
      {/* Label with required indicator */}
      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Tags grid - responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`
                px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                touch-manipulation min-h-[44px]
                ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Selected count indicator */}
      {selectedTags.length > 0 && (
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 font-medium">
          {selectedTags.length} preference{selectedTags.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Error message display */}
      {error && (
        <p className="mt-1.5 text-xs sm:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default TagSelector;
