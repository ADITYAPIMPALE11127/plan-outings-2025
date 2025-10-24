import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

/**
 * App Component
 *
 * Main application component that handles routing between:
 * - Login Form
 * - Registration Form
 *
 * Uses simple state-based routing (no router library needed)
 */

function App() {
  // State to track which form to show: 'login' or 'register'
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  return (
    <>
      {currentView === 'login' ? (
        <LoginForm onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </>
  );
}

export default App;
