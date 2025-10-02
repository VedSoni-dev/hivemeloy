# fred.ai (Meloy Room Connector) - Setup Guide

## Overview
fred.ai is a real-time social network platform for users in the Meloy Room incubator space. It allows residents to see who is currently physically in the room and what they are working on, facilitating spontaneous collaboration.

## Prerequisites
- Node.js and npm installed
- Firebase project created
- React development environment

## Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "fred-ai-meloy")
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 3. Enable Authentication
1. Go to "Authentication" in your Firebase project
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication

### 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 5. Update fred.ai.jsx
Replace the placeholder Firebase configuration in `fred.ai.jsx` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Installation & Usage

### 1. Install Dependencies
```bash
npm install firebase react react-dom
```

### 2. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind CSS
Add to your `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./fred.ai.jsx"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Add Tailwind to your CSS
In your main CSS file, add:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Run the Application
```bash
npm start
```

## Features Implemented

### ✅ Core MVP Features
- **Real-time user profiles** with Firestore integration
- **User authentication** (anonymous sign-in)
- **Profile management** (name, project, background)
- **Manual status cycling** (Away → Online → In Room)
- **Real-time display** with live updates
- **Grouped user sections** (In Room, Online, Away)

### ✅ Data Model
- **Collection**: `meloyProfiles`
- **Fields**: uid, name, project, background, status, lastUpdated
- **Status options**: 'In Room', 'Online', 'Away'

### ✅ AI/Backend Simulation
- **PresenceSimulator component** with hardcoded users (sim_alice, sim_bob, sim_eve)
- **Direct Firestore updates** simulating external Node.js service
- **Real-time reflection** of simulated changes

### ✅ UI/UX Features
- **Professional design** with Tailwind CSS
- **Responsive layout** for all screen sizes
- **Loading states** and error handling
- **User ID display** for multi-terminal verification
- **Status indicators** with color coding
- **Hover effects** and smooth transitions

## Testing Multi-User Functionality

1. **Open multiple browser windows/tabs**
2. **Each will get a unique anonymous user ID**
3. **Update profiles in different windows**
4. **Use the PresenceSimulator** to simulate external updates
5. **Watch real-time updates** across all windows

## Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meloyProfiles/{userId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && request.auth.uid == userId; // Users can only write their own profile
    }
  }
}
```

## Troubleshooting

### Common Issues
1. **Firebase config errors**: Double-check your configuration object
2. **Permission denied**: Ensure Firestore rules allow read/write
3. **Authentication issues**: Verify anonymous auth is enabled
4. **Styling not working**: Ensure Tailwind CSS is properly configured

### Debug Tips
- Check browser console for Firebase errors
- Verify Firestore database has the `meloyProfiles` collection
- Test with multiple browser windows to verify real-time functionality

## Next Steps

1. **Deploy to production** (Firebase Hosting, Vercel, etc.)
2. **Add Canvas token integration** for Texas A&M authentication
3. **Implement actual presence detection** (bluetooth, wifi, etc.)
4. **Add more user features** (messaging, project collaboration, etc.)
5. **Enhance AI simulation** with more realistic user behavior

---

**fred.ai** - Connecting Meloy Room residents in real-time! 🚀


