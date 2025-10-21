import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuWrt8BnVTxyK4IicI9vUtCA_F9oASLT8",
  authDomain: "fred-ai-meloy.firebaseapp.com",
  projectId: "fred-ai-meloy",
  storageBucket: "fred-ai-meloy.firebasestorage.app",
  messagingSenderId: "478257319017",
  appId: "1:478257319017:web:f9af849397271ea99fa6f8",
  measurementId: "G-KW6PHKM8S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
