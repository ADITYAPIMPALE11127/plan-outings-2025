# PlanOutings - Group Outing Planning App

A modern React TypeScript application for planning group outings with friends. Features a Discord-inspired UI with smooth navigation and comprehensive form handling.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Custom CSS with Discord-inspired design
- **State Management**: React Hooks (useState)
- **Storage**: localStorage (mock backend)
- **Build Tool**: Vite/Create React App

## 📁 Project Structure
src/
├── components/
│ ├── styles.css # Global component styles
│ ├── Dashboard.tsx # Landing page with hero section
│ ├── LoginForm.tsx # User login with validation
│ ├── RegisterForm.tsx # User registration with full validation
│ ├── FormInput.tsx # Reusable input field component
│ ├── Button.tsx # Reusable button component
│ ├── TagSelector.tsx # Multi-tag selection component
│ ├── LocationDetector.tsx # Hybrid location detection
│ └── PasswordStrengthMeter.tsx # Visual password validation
├── App.tsx # Main app with navigation routing
├── App.css # Global app styles
└── main.tsx # App entry point


## 🔄 Application Flow

### Navigation Structure

Dashboard (Entry Point)
├── Login Form
│ └── Switch to Register
└── Register Form
└── Switch to Login

### Key Features

1. **Dashboard** - Beautiful landing page with:
   - Hero section with call-to-action buttons
   - Feature showcase
   - How-it-works steps
   - Visual activity preview card

2. **Authentication System**:
   - Login with username/email
   - Comprehensive registration with validation
   - Password strength meter
   - Form validation with error handling

3. **Form Components**:
   - Reusable FormInput with validation states
   - TagSelector for preference selection
   - LocationDetector with geolocation + dropdown
   - PasswordStrengthMeter with visual feedback

## 🎨 Design System

### Color Palette
- **Primary**: Discord blurple (`#5865f2`)
- **Secondary**: Cyan (`#00b0f4`), Pink (`#eb459e`)
- **Background**: Dark grays (`#36393f`, `#2f3136`)
- **Text**: White with subtle gradients

### UI Patterns
- Glass morphism effects with backdrop filters
- Smooth hover animations and transitions
- Gradient accents and text effects
- Consistent spacing and typography
- Mobile-responsive design

## 📋 Component Specifications

### FormInput
- Reusable input field with label, error display, and validation
- Supports various input types and patterns
- Required field indicators
- Responsive design

### Button
- Multiple variants: primary, secondary, outline
- Full-width option
- Disabled state handling
- Proper touch targets

### LocationDetector
- Hybrid location detection:
  - Browser geolocation API
  - Manual city dropdown fallback
- Error handling for permission denials
- Loading states

### TagSelector
- Grid-based tag selection
- Visual selected state
- Selection count display
- Responsive column layout

### PasswordStrengthMeter
- Real-time password strength calculation
- Visual strength bar
- Requirement checklist
- Color-coded feedback

## 🔐 Data Storage

### localStorage Structure
```typescript
// Users array
localStorage.setItem('users', JSON.stringify([
  {
    username: string,
    email: string,
    password: string, // Note: In production, hash passwords
    phoneNumber: string,
    fullName: string,
    preferences: string[],
    location: string,
    createdAt: string
  }
]))

// Current session
localStorage.setItem('currentUser', JSON.stringify(user))

🛠 Development Workflow
Adding New Components
Create component in /components with TypeScript interface

Add styles to styles.css with BEM-like naming convention

Export interface for type safety

Import and use in parent components

Styling Guidelines
Use CSS custom properties for consistency

Follow mobile-first responsive design

Maintain Discord-inspired aesthetic

Ensure proper accessibility (focus states, ARIA labels)

Form Validation Patterns
Real-time field validation

Error state management

Clear user feedback

Prevention of duplicate submissions

🚦 Navigation System
State-based Routing
Uses React state for view management

Supports browser back/forward buttons

History tracking for seamless navigation

Visual back buttons on form pages

Navigation Functions
// In App.tsx
const enhancedNavigation = {
  goToLogin: () => navigateTo('login'),
  goToRegister: () => navigateTo('register'),
  goToDashboard: () => navigateTo('dashboard'),
  goBack: navigateBack,
  canGoBack: history.length > 1
}

📱 Responsive Design
Breakpoints
Mobile: < 640px

Tablet: 640px - 1024px

Desktop: > 1024px

Mobile Optimizations
Touch-friendly button sizes (min-height: 44px)

Stacked layouts on small screens

Optimized typography scaling

Simplified navigation patterns

🎯 Key Features Implementation
Password Strength Algorithm
Length requirements (8+ characters)

Character variety (uppercase, lowercase, numbers, symbols)

Visual progress indicator

Requirement checklist

Location Detection
Geolocation API with fallback

Error handling for various failure scenarios

Mock reverse geocoding (random city selection)

User-friendly error messages

Tag Selection System
Toggle-based selection

Visual feedback for selected state

Limit handling (if needed)

Responsive grid layout

🔧 Setup & Development
Install dependencies:
npm install

Start development server:

npm run dev

Build for production:

npm run build