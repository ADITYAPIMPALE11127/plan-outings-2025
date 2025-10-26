# PlanOutings - Group Outing Planning App

A modern, real-time group outing planning application built with React 19, TypeScript, and Firebase. Features Discord-inspired UI with seamless group chat, polls, image sharing, and comprehensive outing planning tools.

![App Preview](https://via.placeholder.com/800x400/5865f2/ffffff?text=PlanOutings+App)

## 🚀 Features

### Core Functionality
- **Real-time Group Chat** - Instant messaging with emoji reactions and image sharing
- **Group Management** - Create, join, and manage outing groups with admin controls
- **Interactive Polls** - Create polls for outing decisions (dates, locations, activities)
- **User Authentication** - Secure Firebase authentication with email/password
- **Notifications** - Real-time toast notifications for new messages and group invites
- **Responsive Design** - Mobile-first design that works on all devices

### Advanced Features
- **Image Attachments** - Share photos and images in group chats
- **Emoji Picker** - Rich emoji support for expressive communication
- **Message Reactions** - React to messages with emojis
- **Location Preferences** - Store user location preferences for outing suggestions
- **Activity Tags** - Tag-based preference system for outing recommendations

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Type-safe development with comprehensive interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling

### Backend & Services
- **Firebase Authentication** - User authentication and session management
- **Firebase Realtime Database** - Real-time data synchronization
- **React Toastify** - Toast notifications for user feedback
- **Emoji Picker React** - Rich emoji selection component

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing with Autoprefixer
- **TypeScript Compiler** - Type checking and compilation

## 📁 Project Structure

```
plan-outings-2025/
├── public/
│   ├── vite.svg
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Button.tsx              # Reusable button component
│   │   ├── ChatInterface.tsx       # Main chat interface with group management
│   │   ├── Dashboard.tsx           # Landing page with app overview
│   │   ├── EmojiPicker.tsx         # Emoji selection component
│   │   ├── FormInput.tsx           # Reusable form input with validation
│   │   ├── GroupChat.tsx           # Individual group chat component
│   │   ├── GroupCreationModal.tsx  # Modal for creating new groups
│   │   ├── GroupList.tsx           # List of user's groups
│   │   ├── GroupManagementModal.tsx # Group admin controls
│   │   ├── ImageAttachment.tsx     # Image upload and preview
│   │   ├── LocationDetector.tsx    # Location detection component
│   │   ├── LoginForm.tsx           # User login form
│   │   ├── MessageReactions.tsx    # Emoji reactions for messages
│   │   ├── Notifications.tsx       # Notification management
│   │   ├── PasswordStrengthMeter.tsx # Password validation
│   │   ├── PollCreationModal.tsx   # Poll creation interface
│   │   ├── PollMessage.tsx         # Interactive poll display
│   │   ├── RegisterForm.tsx        # User registration form
│   │   ├── TagSelector.tsx         # Multi-select tag component
│   │   ├── styles.css              # Global component styles
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── App.css                 # Main app styles
│   ├── services/
│   │   └── toastNotificationsService.ts # Notification management
│   ├── firebaseConfig.ts           # Firebase configuration
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # App-specific styles
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Application entry point
├── .env                            # Environment variables (Firebase config)
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # This file
```

## 🔄 Application Workflow

### 1. User Registration & Authentication
```
Dashboard → Register/Login → Chat Interface
```

**Registration Flow:**
- User visits dashboard with app overview
- Clicks "Get Started" → navigates to registration
- Fills registration form with validation:
  - Full name, email, username
  - Password with strength meter
  - Location preferences
  - Activity interests (tags)
- Firebase creates user account
- User data stored in Realtime Database
- Automatic login and redirect to chat interface

**Login Flow:**
- Existing users click "Login"
- Email/password authentication via Firebase
- Session persistence with auth state listener
- Redirect to chat interface on success

### 2. Group Management
```
Chat Interface → Create Group → Group Chat
```

**Creating a Group:**
- Click "Create New Group" button
- Fill group details (name, description)
- Add members by searching user database
- Admin privileges assigned to creator
- Real-time notifications sent to invited members
- Group appears in all members' group lists

**Group Administration:**
- Admin can manage members (add/remove)
- Update group name and description
- Delete group (removes all messages and data)
- Transfer admin privileges

### 3. Real-time Group Chat
```
Group List → Select Group → Chat Interface
```

**Messaging Features:**
- Real-time message synchronization
- Text messages with 500 character limit
- Image attachments with preview
- Emoji picker for expressive communication
- Message reactions (like 👍, ❤️, 😂)
- Timestamp display with relative time

**Interactive Elements:**
- **Polls:** Create polls for outing decisions
  - Question and multiple choice options
  - Real-time vote tracking
  - Results visible to all members
- **Images:** Share photos with optional captions
- **Reactions:** React to any message with emojis

### 4. Notification System
```
Background Service → Toast Notifications
```

**Notification Types:**
- New message alerts (with sender and preview)
- Group invitation notifications
- Poll creation alerts
- System notifications (errors, successes)

**Real-time Updates:**
- Messages appear instantly across all devices
- Group changes sync immediately
- Notification preferences (currently all enabled)

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Realtime Database enabled
- Modern web browser with JavaScript enabled

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Enable Realtime Database
4. Get your Firebase config from Project Settings

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd plan-outings-2025
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Design System

### Color Palette
- **Primary:** Discord blurple (#5865f2)
- **Secondary:** Cyan (#00b0f4), Pink (#eb459e)
- **Background:** Dark grays (#36393f, #2f3136)
- **Text:** White with subtle gradients
- **Accent:** Glass morphism effects with backdrop filters

### UI Patterns
- **Glass Morphism:** Translucent backgrounds with blur effects
- **Smooth Animations:** Hover transitions and micro-interactions
- **Responsive Grid:** Mobile-first responsive layouts
- **Consistent Spacing:** Standardized padding and margins
- **Accessibility:** Focus states, ARIA labels, keyboard navigation

## 📊 Data Architecture

### Firebase Realtime Database Structure

```
/users/{uid}
  ├── email: string
  ├── fullName: string
  ├── username?: string
  ├── location?: string
  └── preferences?: string[]

/groups/{groupId}
  ├── name: string
  ├── description: string
  ├── admin: string (uid)
  ├── members: string[] (uids)
  └── createdAt: string

/groupMessages/{groupId}/{messageId}
  ├── userId: string
  ├── userName: string
  ├── text: string
  ├── timestamp: string
  ├── type: 'text' | 'poll' | 'image'
  ├── imageUrl?: string
  ├── poll?: PollData
  └── reactions: {[emoji: string]: string[]}

/notifications/{userId}/{notificationId}
  ├── type: 'group_invitation' | 'message'
  ├── message: string
  ├── timestamp: string
  ├── read: boolean
  └── groupId?: string
```

### State Management
- **React Hooks:** useState for local component state
- **Firebase Listeners:** Real-time data synchronization
- **Context/Props:** Component communication
- **Local Storage:** Session persistence (handled by Firebase)


### Development Guidelines
- Use TypeScript for all new components
- Follow existing naming conventions
- Add proper error handling
- Test on multiple devices/browsers
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Discord** - UI design inspiration
- **Firebase** - Backend services and real-time features
- **React Community** - Excellent documentation and ecosystem
- **Vite** - Fast and reliable build tool

---


