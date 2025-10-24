import React from 'react';
import './styles.css';

interface DashboardProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">PlanOutings</span>
          </div>
          <div className="nav-actions">
            <button 
              className="nav-button nav-button-outline"
              onClick={onNavigateToLogin}
            >
              Sign In
            </button>
            <button 
              className="nav-button nav-button-primary"
              onClick={onNavigateToRegister}
            >
              Start Planning
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">
              <span>✨</span>
              Plan Perfect Outings with Friends
            </div>
            <h1 className="hero-title">
              Group Plans Made
              <span className="gradient-text"> Easy & Fun</span>
            </h1>
            <p className="hero-description">
              Stop the endless WhatsApp chains! Create groups, suggest activities, vote on plans, 
              and coordinate outings seamlessly. From movie nights to weekend trips - plan it all in one place.
            </p>
            
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Create Groups</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🗳️</span>
                <span>Vote on Activities</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📅</span>
                <span>Coordinate Schedules</span>
              </div>
            </div>

            <div className="hero-actions">
              <button 
                className="hero-button hero-button-primary"
                onClick={onNavigateToRegister}
              >
                Plan Your First Outing
                <span className="button-arrow">→</span>
              </button>
              <button 
                className="hero-button hero-button-secondary"
                onClick={onNavigateToLogin}
              >
                Join Existing Group
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="card-title">Weekend Movie Plan</div>
              </div>
              <div className="card-content">
                <div className="outing-preview">
                  <div className="activity-option">
                    <span className="activity-emoji">🎬</span>
                    <span>Jawan Movie @PVR</span>
                    <span className="vote-count">12 votes</span>
                  </div>
                  <div className="activity-option active">
                    <span className="activity-emoji">🍕</span>
                    <span>Pizza & Games</span>
                    <span className="vote-count">15 votes</span>
                  </div>
                  <div className="outing-date">
                    <span>📅 Saturday, 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="features-title">Why PlanOutings Works?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">🤝</div>
              <h3>Group Coordination</h3>
              <p>Create friend groups and plan outings together without the messy group chats.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📍</div>
              <h3>Smart Suggestions</h3>
              <p>Get activity recommendations based on locations and preferences of all group members.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🗳️</div>
              <h3>Democratic Voting</h3>
              <p>Let everyone vote on activities and choose what works best for the whole group.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📱</div>
              <h3>All Devices</h3>
              <p>Plan on the go with our mobile-friendly design that works perfectly everywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🎯</div>
              <h3>RSVP Tracking</h3>
              <p>Know exactly who's coming with real-time RSVP tracking and reminders.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">💰</div>
              <h3>Cost Splitting</h3>
              <p>Easily split costs for tickets, meals, and other outing expenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="steps-section">
        <div className="steps-content">
          <h2 className="steps-title">How PlanOutings Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Group</h3>
              <p>Start a new group and invite your friends via link or email</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Plan Outing</h3>
              <p>Create an event and suggest activities like movies, dining, or trips</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Vote & Decide</h3>
              <p>Members vote on activities and finalize the perfect plan</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Enjoy Together</h3>
              <p>Coordinate timing, split costs, and create amazing memories</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Plan Your Next Adventure?</h2>
          <p className="cta-description">
            Join thousands of friends who are already planning perfect outings together. 
            No more "Where should we go?" or "What should we do?" debates!
          </p>
          <div className="cta-actions">
            <button 
              className="cta-button cta-button-primary"
              onClick={onNavigateToRegister}
            >
              Start Planning Free
            </button>
            <button 
              className="cta-button cta-button-secondary"
              onClick={onNavigateToLogin}
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; 2025 PlanOutings. Making friend outings hassle-free.</p>
          <div className="footer-links">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;