import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import TagSelector from './TagSelector';
import LocationDetector from './LocationDetector';
import PasswordStrengthMeter from './PasswordStrengthMeter';

/**
 * RegisterForm Component
 *
 * Complete registration form with all validations:
 * - Username: 3-20 characters, unique
 * - Email: valid email format
 * - Password: minimum 8 characters with strength meter
 * - Phone: Indian format (+91XXXXXXXXXX)
 * - Full Name: required
 * - Preferences: tag selection
 * - Location: hybrid detection + dropdown
 */

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
];

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  // Form state
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

  // Error state for each field
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Handle input field changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate individual field
   * Returns error message if validation fails, empty string if valid
   */
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscore';

        // Check if username exists in localStorage (mock uniqueness check)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((u: any) => u.username === value)) {
          return 'Username already taken';
        }
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';

        // Check if email exists in localStorage (mock uniqueness check)
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
        // Indian phone format: +91XXXXXXXXXX (10 digits after +91)
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

  /**
   * Validate all fields before submission
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate all text fields
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    // Validate preferences
    if (selectedPreferences.length === 0) {
      newErrors.preferences = 'Please select at least one preference';
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

    // Create user object
    const newUser = {
      username: formData.username,
      email: formData.email,
      password: formData.password, // In real app, this would be hashed
      phoneNumber: formData.phoneNumber,
      fullName: formData.fullName,
      preferences: selectedPreferences,
      location: formData.location,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (mock database)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Success message
    alert(`Registration successful!\nWelcome, ${formData.fullName}!`);

    // Reset form
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

    // Switch to login
    onSwitchToLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1.5 sm:mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Join us today and start exploring</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-1">
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
          <div className="pt-2 sm:pt-4">
            <Button type="submit" variant="primary" fullWidth>
              Create Account
            </Button>
          </div>

          {/* Switch to Login */}
          <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium underline-offset-2 hover:underline touch-manipulation"
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
