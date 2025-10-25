import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import TagSelector from './TagSelector';
import LocationDetector from './LocationDetector';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import './styles.css';
import { auth, db, googleProvider } from "../firebaseConfig";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { toast } from 'react-toastify';

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
  onGoBack?: () => void; // Optional back navigation
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onGoBack }) => {
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be at most 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscore';
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
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
        if (!/^\+91[6-9]\d{9}$/.test(value)) return 'Invalid phone format. Use +91XXXXXXXXXX';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const toastId = toast.loading('Creating your account...');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        preferences: selectedPreferences,
        location: formData.location,
        createdAt: new Date().toISOString(),
        provider: "email",
      });

      toast.update(toastId, {
        render: `Welcome, ${formData.fullName}!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

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

      setTimeout(() => onSwitchToLogin(), 1000);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast.update(toastId, {
        render: error.message || 'Registration failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const toastId = toast.loading('Signing in with Google...');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        await set(userRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || "",
          photoURL: user.photoURL || "",
          provider: "google",
          createdAt: new Date().toISOString(),
          preferences: [],
          location: "",
        });
      }

      toast.update(toastId, {
        render: `Welcome ${user.displayName || user.email}!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      toast.update(toastId, {
        render: 'Google Sign-In failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join us today and start exploring</p>
        </div>

        {/* Back Button */}
        {onGoBack && (
          <button type="button" onClick={onGoBack} className="form-back-button">
            ← Back
          </button>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
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

          <PasswordStrengthMeter password={formData.password} />

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

          <TagSelector
            label="Preferences"
            tags={PREFERENCE_TAGS}
            selectedTags={selectedPreferences}
            onChange={setSelectedPreferences}
            error={errors.preferences}
            required
          />

          <LocationDetector
            label="Location"
            cities={INDIAN_CITIES}
            selectedCity={formData.location}
            onChange={(city) => {
              setFormData((prev) => ({ ...prev, location: city }));
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            error={errors.location}
            required
          />

          <div className="register-submit-section">
            <Button type="submit" variant="primary" fullWidth>
              Create Account
            </Button>
          </div>

          {/* Google Sign-In */}
          <div className="google-login-container">
            <Button type="button" variant="secondary" fullWidth onClick={handleGoogleSignIn}>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                style={{ width: "18px", marginRight: "8px", verticalAlign: "middle" }}
              />
              Sign up with Google
            </Button>
          </div>

          <p className="register-switch-text">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="register-switch-link">
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;