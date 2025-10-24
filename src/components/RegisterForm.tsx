import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import TagSelector from './TagSelector';
import LocationDetector from './LocationDetector';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import './styles.css';

// Predefined preference tags
const PREFERENCE_TAGS = [
  'Action Movies',
  'Comedy',
  'Italian Food',
  'Chinese',
  'Indian Food',
  'Cafes',
  'Adventure',
  'Shopping',
];

// Indian cities for location dropdown
const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Patna',
];

export interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onGoBack?: () => void; // Add optional back navigation
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    fullName: '',
    location: '',
  });

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscore';

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((u: any) => u.username === value)) {
          return 'Username already taken';
        }
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';

        const emailUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (emailUsers.some((u: any) => u.email === value)) {
          return 'Email already registered';
        }
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';

      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        if (!/^\+91[6-9]\d{9}$/.test(value)) {
          return 'Invalid phone format. Use +91XXXXXXXXXX (e.g., +919876543210)';
        }
        return '';

      case 'fullName':
        if (!value) return 'Full name is required';
        if (value.length < 2) return 'Full name must be at least 2 characters';
        return '';

      case 'location':
        if (!value) return 'Location is required';
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (selectedPreferences.length === 0) {
      newErrors.preferences = 'Please select at least one preference';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newUser = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      fullName: formData.fullName,
      preferences: selectedPreferences,
      location: formData.location,
      createdAt: new Date().toISOString(),
    };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert(`Registration successful!\nWelcome, ${formData.fullName}!`);

    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      fullName: '',
      location: '',
    });
    setSelectedPreferences([]);
    setErrors({});
    onSwitchToLogin();
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join us today and start exploring</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Username */}
          <FormInput
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            placeholder="johndoe"
            required
            maxLength={20}
          />

          {/* Email */}
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="john@example.com"
            required
          />

          {/* Full Name */}
          <FormInput
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
            placeholder="John Doe"
            required
          />

          {/* Phone Number */}
          <FormInput
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
            placeholder="+919876543210"
            required
            pattern="^\+91[6-9]\d{9}$"
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

          {/* Password Strength Meter */}
          <PasswordStrengthMeter password={formData.password} />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          {/* Preferences */}
          <TagSelector
            label="Preferences"
            tags={PREFERENCE_TAGS}
            selectedTags={selectedPreferences}
            onChange={setSelectedPreferences}
            error={errors.preferences}
            required
          />

          {/* Location */}
          <LocationDetector
            label="Location"
            cities={INDIAN_CITIES}
            selectedCity={formData.location}
            onChange={(city) => {
              setFormData((prev) => ({ ...prev, location: city }));
              if (errors.location) {
                setErrors((prev) => ({ ...prev, location: '' }));
              }
            }}
            error={errors.location}
            required
          />

          {/* Submit Button */}
          <div className="register-submit-section">
            <Button type="submit" variant="primary" fullWidth>
              Create Account
            </Button>
          </div>

          {/* Switch to Login */}
          <p className="register-switch-text">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="register-switch-link"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;