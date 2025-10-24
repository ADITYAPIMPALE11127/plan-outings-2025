import React from 'react';

/**
 * PasswordStrengthMeter Component
 *
 * Displays visual feedback for password strength
 * Calculates strength based on multiple criteria:
 * - Length (minimum 8 characters)
 * - Uppercase letters
 * - Lowercase letters
 * - Numbers
 * - Special characters
 *
 * @param password - The password to evaluate
 */

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  /**
   * Calculate password strength score (0-5)
   * Each criteria met adds 1 point
   */
  const calculateStrength = (): number => {
    let strength = 0;

    if (password.length >= 8) strength++; // Minimum length
    if (password.length >= 12) strength++; // Good length
    if (/[a-z]/.test(password)) strength++; // Contains lowercase
    if (/[A-Z]/.test(password)) strength++; // Contains uppercase
    if (/[0-9]/.test(password)) strength++; // Contains number
    if (/[^a-zA-Z0-9]/.test(password)) strength++; // Contains special character

    return strength;
  };

  /**
   * Get strength level details
   * Returns color, width percentage, and label
   */
  const getStrengthDetails = () => {
    const strength = calculateStrength();

    if (password.length === 0) {
      return { color: 'bg-gray-300', width: '0%', label: '', textColor: 'text-gray-500' };
    }

    if (strength <= 2) {
      return { color: 'bg-red-500', width: '33%', label: 'Weak', textColor: 'text-red-500' };
    }

    if (strength <= 4) {
      return { color: 'bg-yellow-500', width: '66%', label: 'Medium', textColor: 'text-yellow-600' };
    }

    return { color: 'bg-green-500', width: '100%', label: 'Strong', textColor: 'text-green-600' };
  };

  const { color, width, label, textColor } = getStrengthDetails();

  // Don't show meter if password is empty
  if (password.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 sm:mt-3">
      {/* Strength bar container */}
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
        {/* Strength bar fill */}
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width }}
        ></div>
      </div>

      {/* Strength label and tips */}
      <div className="mt-2 sm:mt-3">
        <p className={`text-xs sm:text-sm font-medium ${textColor}`}>
          Password Strength: {label}
        </p>

        {/* Password requirements checklist */}
        <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-600">
          <li className={password.length >= 8 ? 'text-green-600 font-medium' : ''}>
            <span className="inline-block w-4">{password.length >= 8 ? '✓' : '○'}</span> At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600 font-medium' : ''}>
            <span className="inline-block w-4">{/[A-Z]/.test(password) ? '✓' : '○'}</span> One uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600 font-medium' : ''}>
            <span className="inline-block w-4">{/[a-z]/.test(password) ? '✓' : '○'}</span> One lowercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600 font-medium' : ''}>
            <span className="inline-block w-4">{/[0-9]/.test(password) ? '✓' : '○'}</span> One number
          </li>
          <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600 font-medium' : ''}>
            <span className="inline-block w-4">{/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'}</span> One special character (!@#$%)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
