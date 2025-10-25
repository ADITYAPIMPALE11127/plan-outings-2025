import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ChatInterface from './components/ChatInterface';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * App Component
 *
 * Main application component that handles routing between:
 * - Dashboard (Entry Page)
 * - Login Form
 * - Registration Form
 *
 * Supports browser back/forward navigation and maintains history
 */

type AppView = 'dashboard' | 'login' | 'register' | 'chat';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [history, setHistory] = useState<AppView[]>(['dashboard']);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentView('chat');
        setHistory(['chat']);
      } else {
        if (currentView === 'chat') {
          setCurrentView('dashboard');
          setHistory(['dashboard']);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setHistory(prev => [...prev, view]);
  };

  const navigateBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousView = newHistory[newHistory.length - 1];
      setCurrentView(previousView);
      setHistory(newHistory);
    }
  };

  const handleLoginSuccess = () => {
    navigateTo('chat');
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView(user ? 'chat' : 'dashboard');
        setHistory([user ? 'chat' : 'dashboard']);
      }
    };

    window.history.replaceState({ view: user ? 'chat' : 'dashboard' }, '', '/');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user]);

  useEffect(() => {
    if (currentView !== 'dashboard') {
      window.history.pushState({ view: currentView }, '', `/${currentView}`);
    } else {
      window.history.pushState({ view: 'dashboard' }, '', '/');
    }
  }, [currentView]);

  const enhancedNavigation = {
    goToLogin: () => navigateTo('login'),
    goToRegister: () => navigateTo('register'),
    goToDashboard: () => navigateTo('dashboard'),
    goBack: navigateBack,
    canGoBack: history.length > 1
  };

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {currentView !== 'dashboard' && currentView !== 'chat' && (
        <button
          className="back-button"
          onClick={enhancedNavigation.goBack}
          aria-label="Go back"
        >
          <span className="back-arrow">←</span>
          Back
        </button>
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          onNavigateToLogin={enhancedNavigation.goToLogin}
          onNavigateToRegister={enhancedNavigation.goToRegister}
        />
      )}
      {currentView === 'login' && (
        <LoginForm
          onSwitchToRegister={enhancedNavigation.goToRegister}
          onGoBack={enhancedNavigation.goBack}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === 'register' && (
        <RegisterForm
          onSwitchToLogin={enhancedNavigation.goToLogin}
          onGoBack={enhancedNavigation.goBack}
        />
      )}
      {currentView === 'chat' && user && (
        <ChatInterface />
      )}
    </div>
  );
}

export default App;