import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import './styles.css';
import { auth, db, googleProvider } from "../firebaseConfig"; 
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { ref, get, set } from "firebase/database"; 

export interface LoginFormProps {
  onSwitchToRegister: () => void;
  onGoBack?: () => void; // Optional back navigation
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.usernameOrEmail.trim()) newErrors.usernameOrEmail = 'Username or email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        setLoginError('No users found');
        return;
      }

      const usersData = snapshot.val();
      let userFound = null;

      for (const key in usersData) {
        const user = usersData[key];
        if (
          (user.username === formData.usernameOrEmail || user.email === formData.usernameOrEmail) &&
          user.password === formData.password
        ) {
          userFound = user;
          break;
        }
      }

      if (userFound) {
        alert(
          `Login successful!\n\nWelcome back, ${userFound.fullName}!\n\nYour Details:\n` +
          `Username: ${userFound.username}\n` +
          `Email: ${userFound.email}\n` +
          `Phone: ${userFound.phoneNumber}\n` +
          `Location: ${userFound.location}\n` +
          `Preferences: ${userFound.preferences.join(', ')}`
        );
        setFormData({ usernameOrEmail: '', password: '' });
        setErrors({});
        setLoginError('');
      } else {
        setLoginError('Invalid username/email or password');
      }
    } catch (error) {
      console.error("Firebase login error:", error);
      setLoginError('Login failed. Try again.');
    }
  };

  // ✅ Google Sign-In using Redirect (avoids COOP issues)
  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  // Handle redirect result after Google login
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const user = result.user;
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);

          if (!snapshot.exists()) {
            await set(userRef, {
              email: user.email,
              fullName: user.displayName || "",
              photoURL: user.photoURL || "",
              provider: "google",
              createdAt: new Date().toISOString(),
            });
          }

          alert(`Welcome ${user.displayName || user.email}!`);
        }
      })
      .catch((error) => {
        console.error("Redirect Sign-In error:", error);
        alert("Google Sign-In failed. Please try again.");
      });
  }, []);

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
            label="Username or Email"
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleInputChange}
            error={errors.usernameOrEmail}
            placeholder="Enter username or email"
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
