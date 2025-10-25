import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import './styles.css';
import { auth, db, googleProvider } from "../firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from 'react-toastify'; 

export interface LoginFormProps {
  onSwitchToRegister: () => void;
  onGoBack?: () => void;
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onGoBack, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const toastId = toast.loading('Signing in...');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        toast.update(toastId, {
          render: `Welcome back, ${userData.fullName}!`,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: 'Welcome back!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      }

      setFormData({ email: '', password: '' });
      setErrors({});
      setLoginError('');

      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.message || 'Login failed. Please try again.';

      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
      setLoginError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    const toastId = toast.loading('Signing in with Google...');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
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

      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 1000);
      }
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        {onGoBack && (
          <button type="button" onClick={onGoBack} className="form-back-button">
            ← Back to Home
          </button>
        )}

        {loginError && (
          <div className="login-error-alert">
            <p className="login-error-text">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="Enter your email"
            required
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

          <div className="forgot-password-container">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => alert('Password reset functionality would be implemented here')}
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Sign In
          </Button>

          <div className="login-divider">
            <div className="login-divider-line"></div>
            <div className="login-divider-text"><span>or</span></div>
          </div>

          <div className="google-login-container">
            <Button type="button" variant="secondary" fullWidth onClick={handleGoogleSignIn}>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                style={{ width: "18px", marginRight: "8px", verticalAlign: "middle" }}
              />
              Sign in with Google
            </Button>
          </div>

          <p className="login-switch-text">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="login-switch-link">
              Create Account
            </button>
          </p>
        </form>

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
