import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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
const db = getFirestore(app);
const auth = getAuth(app);

const FredAI = () => {
  // State management
  const [user, setUser] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    project: '',
    background: '',
    status: 'Away'
  });

  // Initialize authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log('User authenticated:', user.uid);
        
        // Initialize user profile if it doesn't exist
        await initializeUserProfile(user.uid);
        setLoading(false);
      } else {
        // Try anonymous authentication
        try {
          const result = await signInAnonymously(auth);
          setUser(result.user);
          console.log('Anonymous user created:', result.user.uid);
        } catch (error) {
          console.error('Authentication error:', error);
          setError('Failed to authenticate user');
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize user profile in Firestore
  const initializeUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'meloyProfiles', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userId,
          name: 'Anonymous User',
          project: '',
          background: '',
          status: 'Away',
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
      setError('Failed to initialize user profile');
    }
  };

  // Real-time listener for user profiles
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, 'meloyProfiles'),
      (snapshot) => {
        const profiles = [];
        snapshot.forEach((doc) => {
          profiles.push({ id: doc.id, ...doc.data() });
        });
        setUserProfiles(profiles);
        
        // Update current user's profile state
        const currentUserProfile = profiles.find(p => p.uid === user.uid);
        if (currentUserProfile) {
          setProfile({
            name: currentUserProfile.name || '',
            project: currentUserProfile.project || '',
            background: currentUserProfile.background || '',
            status: currentUserProfile.status || 'Away'
          });
        }
      },
      (error) => {
        console.error('Error listening to profiles:', error);
        setError('Failed to load user profiles');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update user profile
  const updateProfile = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'meloyProfiles', user.uid);
      await updateDoc(userRef, {
        name: profile.name,
        project: profile.project,
        background: profile.background,
        lastUpdated: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  // Cycle through status options
  const cycleStatus = async () => {
    if (!user) return;
    
    const statusOrder = ['Away', 'Online', 'In Room'];
    const currentIndex = statusOrder.indexOf(profile.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    try {
      const userRef = doc(db, 'meloyProfiles', user.uid);
      await updateDoc(userRef, {
        status: nextStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  // Simulate external user updates (for PresenceSimulator)
  const simulateUserUpdate = async (simUserId, newStatus) => {
    try {
      const userRef = doc(db, 'meloyProfiles', simUserId);
      await updateDoc(userRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error simulating user update:', error);
      setError('Failed to simulate user update');
    }
  };

  // Group users by status
  const groupedUsers = userProfiles.reduce((acc, userProfile) => {
    const status = userProfile.status || 'Away';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(userProfile);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fred.ai...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">fred.ai</h1>
              <p className="text-gray-600">Meloy Room Connector</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">User ID:</p>
              <p className="font-mono text-sm text-gray-700">{user?.uid}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <input
                      type="text"
                      value={profile.project}
                      onChange={(e) => setProfile({...profile, project: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What are you working on?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                    <textarea
                      value={profile.background}
                      onChange={(e) => setProfile({...profile, background: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Your expertise/skillset"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={updateProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save Profile
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                      <p className="text-gray-600">{profile.project}</p>
                      <p className="text-sm text-gray-500 mt-1">{profile.background}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.status === 'In Room' ? 'bg-green-100 text-green-800' :
                        profile.status === 'Online' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={cycleStatus}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Groups */}
            <div className="space-y-6">
              {/* In The Meloy Room */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  In The Meloy Room ({groupedUsers['In Room']?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedUsers['In Room']?.map((userProfile) => (
                    <div key={userProfile.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{userProfile.name}</h4>
                          <p className="text-sm text-gray-600">{userProfile.project}</p>
                          <p className="text-xs text-gray-500 mt-1">{userProfile.background}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {userProfile.lastUpdated?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!groupedUsers['In Room'] || groupedUsers['In Room'].length === 0) && (
                    <p className="text-gray-500 text-sm col-span-2">No one is currently in the Meloy Room</p>
                  )}
                </div>
              </div>

              {/* Online */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Online ({groupedUsers['Online']?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedUsers['Online']?.map((userProfile) => (
                    <div key={userProfile.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{userProfile.name}</h4>
                          <p className="text-sm text-gray-600">{userProfile.project}</p>
                          <p className="text-xs text-gray-500 mt-1">{userProfile.background}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {userProfile.lastUpdated?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!groupedUsers['Online'] || groupedUsers['Online'].length === 0) && (
                    <p className="text-gray-500 text-sm col-span-2">No one is currently online</p>
                  )}
                </div>
              </div>

              {/* Away */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  Away ({groupedUsers['Away']?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedUsers['Away']?.map((userProfile) => (
                    <div key={userProfile.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{userProfile.name}</h4>
                          <p className="text-sm text-gray-600">{userProfile.project}</p>
                          <p className="text-xs text-gray-500 mt-1">{userProfile.background}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {userProfile.lastUpdated?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!groupedUsers['Away'] || groupedUsers['Away'].length === 0) && (
                    <p className="text-gray-500 text-sm col-span-2">No one is currently away</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PresenceSimulator Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PresenceSimulator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Simulates external AI/Node.js service updates
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Simulated Users</h4>
                  
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-sm">Alice (sim_alice)</h5>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => simulateUserUpdate('sim_alice', 'In Room')}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                        >
                          In Room
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_alice', 'Online')}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                        >
                          Online
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_alice', 'Away')}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded hover:bg-gray-200"
                        >
                          Away
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-sm">Bob (sim_bob)</h5>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => simulateUserUpdate('sim_bob', 'In Room')}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                        >
                          In Room
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_bob', 'Online')}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                        >
                          Online
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_bob', 'Away')}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded hover:bg-gray-200"
                        >
                          Away
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-sm">Eve (sim_eve)</h5>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => simulateUserUpdate('sim_eve', 'In Room')}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                        >
                          In Room
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_eve', 'Online')}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                        >
                          Online
                        </button>
                        <button
                          onClick={() => simulateUserUpdate('sim_eve', 'Away')}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded hover:bg-gray-200"
                        >
                          Away
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    This simulates how an external Node.js server would update user presence data in Firestore, 
                    which is then instantly reflected on the frontend for all users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FredAI;
