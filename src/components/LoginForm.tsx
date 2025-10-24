import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';

/**
 * LoginForm Component
 *
 * User login form with validation:
 * - Username/Email: can login with either
 * - Password: required field
 * - Validates against localStorage mock data
 */

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  // Form state
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // Error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Login attempt state
  const [loginError, setLoginError] = useState('');

  /**
   * Handle input field changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate username/email
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Get users from localStorage (mock database)
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user by username or email
    const user = users.find(
      (u: any) =>
        (u.username === formData.usernameOrEmail || u.email === formData.usernameOrEmail) &&
        u.password === formData.password
    );

    if (user) {
      // Login successful
      // Save logged in user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Success message with user details
      alert(
        `Login successful!\n\nWelcome back, ${user.fullName}!\n\nYour Details:\n` +
        `Username: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Phone: ${user.phoneNumber}\n` +
        `Location: ${user.location}\n` +
        `Preferences: ${user.preferences.join(', ')}`
      );

      // Reset form
      setFormData({
        usernameOrEmail: '',
        password: '',
      });
      setErrors({});
      setLoginError('');
    } else {
      // Login failed
      setLoginError('Invalid username/email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1.5 sm:mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to continue</p>
        </div>

        {/* Login error display */}
        {loginError && (
          <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-600 text-center font-medium">{loginError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-1">
          {/* Username or Email */}
          <FormInput
            label="Username or Email"
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleInputChange}
            error={errors.usernameOrEmail}
            placeholder="Enter username or email"
            required
          />

          {/* Password */}
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          {/* Forgot Password Link */}
          <div className="mb-5 sm:mb-6 text-right">
            <button
              type="button"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline-offset-2 hover:underline touch-manipulation"
              onClick={() => alert('Password reset functionality would be implemented here')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" fullWidth>
            Sign In
          </Button>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-3 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Switch to Register */}
          <p className="text-center text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline-offset-2 hover:underline touch-manipulation"
            >
              Create Account
            </button>
          </p>
        </form>

        {/* Demo credentials info */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
            <strong className="text-blue-700">Demo Tip:</strong> Register a new account first, then use those credentials to log in
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
