import React from 'react';
import './styles.css';

export interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (): number => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
  };

  const getStrengthDetails = () => {
    const strength = calculateStrength();

    if (password.length === 0) {
      return { 
        className: 'password-strength-empty', 
        label: '', 
        textClass: '' 
      };
    }

    if (strength <= 2) {
      return { 
        className: 'password-strength-weak', 
        label: 'Weak', 
        textClass: 'password-strength-text-weak' 
      };
    }

    if (strength <= 4) {
      return { 
        className: 'password-strength-medium', 
        label: 'Medium', 
        textClass: 'password-strength-text-medium' 
      };
    }

    return { 
      className: 'password-strength-strong', 
      label: 'Strong', 
      textClass: 'password-strength-text-strong' 
    };
  };

  const { className, label, textClass } = getStrengthDetails();

  if (password.length === 0) {
    return null;
  }

  return (
    <div className="password-strength-meter">
      {/* Strength bar container */}
      <div className="password-strength-bar-container">
        {/* Strength bar fill */}
        <div className={`password-strength-bar-fill ${className}`}></div>
      </div>

      {/* Strength label and tips */}
      <div className="password-strength-content">
        <p className={`password-strength-label ${textClass}`}>
          Password Strength: {label}
        </p>

        {/* Password requirements checklist */}
        <ul className="password-requirements">
          <li className={`password-requirement-item ${password.length >= 8 ? 'password-requirement-met' : ''}`}>
            <span className="password-requirement-icon">
              {password.length >= 8 ? '✓' : '○'}
            </span>
            At least 8 characters
          </li>
          <li className={`password-requirement-item ${/[A-Z]/.test(password) ? 'password-requirement-met' : ''}`}>
            <span className="password-requirement-icon">
              {/[A-Z]/.test(password) ? '✓' : '○'}
            </span>
            One uppercase letter
          </li>
          <li className={`password-requirement-item ${/[a-z]/.test(password) ? 'password-requirement-met' : ''}`}>
            <span className="password-requirement-icon">
              {/[a-z]/.test(password) ? '✓' : '○'}
            </span>
            One lowercase letter
          </li>
          <li className={`password-requirement-item ${/[0-9]/.test(password) ? 'password-requirement-met' : ''}`}>
            <span className="password-requirement-icon">
              {/[0-9]/.test(password) ? '✓' : '○'}
            </span>
            One number
          </li>
          <li className={`password-requirement-item ${/[^a-zA-Z0-9]/.test(password) ? 'password-requirement-met' : ''}`}>
            <span className="password-requirement-icon">
              {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'}
            </span>
            One special character (!@#$%)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;