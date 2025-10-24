import React from 'react';
import './styles.css';

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

export interface ButtonProps {
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
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        button
        button-${variant}
        ${fullWidth ? 'button-full' : ''}
      `}
    >
      {children}
    </button>
  );
};

export default Button;