import React from 'react';

/**
 * Button Component
 *
 * A reusable button component with different variants and states
 *
 * @param children - Button text or content
 * @param onClick - Click handler function
 * @param type - Button type (button, submit, reset)
 * @param variant - Visual style variant (primary, secondary, outline)
 * @param fullWidth - Whether button should take full width
 * @param disabled - Whether button is disabled
 */

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
}) => {
  // Define styles for each variant
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500',
    outline: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
  };

  // Disabled styles
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        touch-manipulation min-h-[44px]
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? disabledStyles : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
