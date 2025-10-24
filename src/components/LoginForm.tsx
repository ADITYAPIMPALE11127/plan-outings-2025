import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import './styles.css';

export interface LoginFormProps {
  onSwitchToRegister: () => void;
  onGoBack?: () => void; // Add optional back navigation
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onGoBack }) => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      (u: any) =>
        (u.username === formData.usernameOrEmail || u.email === formData.usernameOrEmail) &&
        u.password === formData.password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      alert(
        `Login successful!\n\nWelcome back, ${user.fullName}!\n\nYour Details:\n` +
        `Username: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Phone: ${user.phoneNumber}\n` +
        `Location: ${user.location}\n` +
        `Preferences: ${user.preferences.join(', ')}`
      );
      setFormData({ usernameOrEmail: '', password: '' });
      setErrors({});
      setLoginError('');
    } else {
      setLoginError('Invalid username/email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        {/* Back Button */}
        {onGoBack && (
          <button 
            type="button"
            onClick={onGoBack}
            className="form-back-button"
          >
            ← Back to Home
          </button>
        )}

        {/* Login error display */}
        {loginError && (
          <div className="login-error-alert">
            <p className="login-error-text">{loginError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
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
          <div className="forgot-password-container">
            <button
              type="button"
              className="forgot-password-link"
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
          <div className="login-divider">
            <div className="login-divider-line"></div>
            <div className="login-divider-text">
              <span>or</span>
            </div>
          </div>

          {/* Switch to Register */}
          <p className="login-switch-text">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="login-switch-link"
            >
              Create Account
            </button>
          </p>
        </form>

        {/* Demo credentials info */}
        <div className="login-demo-info">
          <p className="login-demo-text">
            <span className="login-demo-highlight">Demo Tip:</span> Register a new account first, then use those credentials to log in
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;