import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

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

type AppView = 'dashboard' | 'login' | 'register';

function App() {
  // State to track which view to show
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [history, setHistory] = useState<AppView[]>(['dashboard']);

  /**
   * Navigate to a new view and update history
   */
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setHistory(prev => [...prev, view]);
  };

  /**
   * Navigate back to previous view
   */
  const navigateBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current view
      const previousView = newHistory[newHistory.length - 1];
      setCurrentView(previousView);
      setHistory(newHistory);
    }
  };

  /**
   * Handle browser back/forward buttons
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If there's state in the history, use it
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        // Otherwise go back to dashboard
        setCurrentView('dashboard');
        setHistory(['dashboard']);
      }
    };

    // Push initial state
    window.history.replaceState({ view: 'dashboard' }, '', '/');

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  /**
   * Update browser history when view changes
   */
  useEffect(() => {
    if (currentView !== 'dashboard') {
      window.history.pushState({ view: currentView }, '', `/${currentView}`);
    } else {
      window.history.pushState({ view: 'dashboard' }, '', '/');
    }
  }, [currentView]);

  /**
   * Enhanced navigation functions with history management
   */
  const enhancedNavigation = {
    goToLogin: () => navigateTo('login'),
    goToRegister: () => navigateTo('register'),
    goToDashboard: () => navigateTo('dashboard'),
    goBack: navigateBack,
    canGoBack: history.length > 1
  };

  return (
    <div className="app-container">
      {/* Back Button - Show when not on dashboard */}
      {currentView !== 'dashboard' && (
        <button 
          className="back-button"
          onClick={enhancedNavigation.goBack}
          aria-label="Go back"
        >
          <span className="back-arrow">←</span>
          Back
        </button>
      )}

      {/* Main Content */}
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
        />
      )}
      {currentView === 'register' && (
        <RegisterForm 
          onSwitchToLogin={enhancedNavigation.goToLogin}
          onGoBack={enhancedNavigation.goBack}
        />
      )}
    </div>
  );
}

export default App;