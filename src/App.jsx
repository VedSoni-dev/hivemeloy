import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProfileCard from './components/profile/ProfileCard';
import MessagePanel from './components/messaging/MessagePanel';
import ActivityFeed from './components/notifications/ActivityFeed';
import Button from './components/shared/Button';
import Badge from './components/shared/Badge';
import { IoRefresh, IoAdd, IoChatbubblesOutline } from 'react-icons/io5';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMessagePanelOpen, setIsMessagePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState({
    name: '',
    project: '',
    background: '',
    skills: [],
    status: 'Away'
  });

  // Initialize user profile in Firestore
  const initializeUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userId,
          name: user?.displayName || 'Anonymous User',
          project: '',
          background: '',
          skills: [],
          status: 'Away',
          lastUpdated: serverTimestamp(),
          email: user?.email || ''
        });
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  // Real-time listener for user profiles
  useEffect(() => {
    if (!user) return;

    const initializeProfile = async () => {
      await initializeUserProfile(user.uid);
    };
    
    initializeProfile();

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
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
            skills: currentUserProfile.skills || [],
            status: currentUserProfile.status || 'Away'
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to profiles:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update user profile
  const updateProfile = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profile.name,
        project: profile.project,
        background: profile.background,
        skills: profile.skills,
        lastUpdated: serverTimestamp()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Cycle through status options
  const cycleStatus = async () => {
    if (!user) return;
    
    const statusOrder = ['Away', 'Online', 'In Room'];
    const currentIndex = statusOrder.indexOf(profile.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        status: nextStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating status:', error);
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

  // Simulate external user updates
  const simulateUserUpdate = async (simUserId, newStatus) => {
    try {
      const userRef = doc(db, 'users', simUserId);
      await updateDoc(userRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error simulating user update:', error);
    }
  };

  const handleMessage = (targetUser) => {
    console.log('Message user:', targetUser);
    setIsMessagePanelOpen(true);
    // TODO: Pass target user to message panel for direct messaging
  };

  const handleViewProfile = (targetUser) => {
    console.log('View profile:', targetUser);
    // TODO: Implement profile modal
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'messages':
        return renderMessagesContent();
      case 'people':
        return renderPeopleContent();
      case 'projects':
        return renderProjectsContent();
      case 'search':
        return renderSearchContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => (
    <div className="space-y-8">
      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h2>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
              <input
                type="text"
                value={profile.project}
                onChange={(e) => setProfile({...profile, project: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="What are you working on?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
              <textarea
                value={profile.background}
                onChange={(e) => setProfile({...profile, background: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Your expertise/skillset"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={updateProfile}>
                Save Profile
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{profile.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.project}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.background}</p>
              </div>
              <div className="text-right">
                <Badge variant={profile.status === 'In Room' ? 'success' : profile.status === 'Online' ? 'primary' : 'default'}>
                  {profile.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button variant="secondary" onClick={cycleStatus}>
                <IoRefresh className="w-4 h-4 mr-1" />
                Cycle Status
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Groups */}
      <div className="space-y-6">
        
        {/* In The Meloy Room */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            In The Meloy Room ({groupedUsers['In Room']?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedUsers['In Room']?.map((userProfile) => (
              <ProfileCard
                key={userProfile.uid}
                user={userProfile}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
              />
            ))}
            {(!groupedUsers['In Room'] || groupedUsers['In Room'].length === 0) && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No one is currently in the Meloy Room</p>
              </div>
            )}
          </div>
        </div>

        {/* Online */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Online ({groupedUsers['Online']?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedUsers['Online']?.map((userProfile) => (
              <ProfileCard
                key={userProfile.uid}
                user={userProfile}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
              />
            ))}
            {(!groupedUsers['Online'] || groupedUsers['Online'].length === 0) && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No one is currently online</p>
              </div>
            )}
          </div>
        </div>

        {/* Away */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            Away ({groupedUsers['Away']?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedUsers['Away']?.map((userProfile) => (
              <ProfileCard
                key={userProfile.uid}
                user={userProfile}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
              />
            ))}
            {(!groupedUsers['Away'] || groupedUsers['Away'].length === 0) && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No one is currently away</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PresenceSimulator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PresenceSimulator</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Simulates external AI/Node.js service updates
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['sim_alice', 'sim_bob', 'sim_eve'].map((simUserId) => (
            <div key={simUserId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-3 capitalize">
                {simUserId.replace('sim_', '')}
              </h5>
              <div className="flex flex-wrap gap-2">
                {['In Room', 'Online', 'Away'].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => simulateUserUpdate(simUserId, status)}
                    className="text-xs"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This simulates how an external Node.js server would update user presence data in Firestore, 
            which is then instantly reflected on the frontend for all users.
          </p>
        </div>
      </div>
    </div>
  );

  const renderMessagesContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Messages</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start conversations with other room members and collaborate in real-time.
        </p>
        <Button onClick={() => setIsMessagePanelOpen(true)}>
          <IoChatbubblesOutline className="w-4 h-4 mr-2" />
          Open Messages
        </Button>
      </div>
    </div>
  );

  const renderPeopleContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All People</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfiles.map((userProfile) => (
            <ProfileCard
              key={userProfile.uid}
              user={userProfile}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjectsContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Project collaboration features coming soon!
        </p>
      </div>
    </div>
  );

  const renderSearchContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Search</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced search features coming soon!
        </p>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Settings panel coming soon!
        </p>
      </div>
    </div>
  );

  // Show loading only while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading fred.ai...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        
        {/* Auth Modal */}
        <Layout 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onAuthModalOpen={() => {}}
        >
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-3xl">f</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome to fred.ai</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Meloy Room Connector</p>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Connect with fellow innovators in the Meloy Room. Share your projects, collaborate in real-time, and build something amazing together.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  size="lg"
                  onClick={() => document.querySelector('[data-auth-modal-trigger]')?.click()}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Message Panel */}
      <MessagePanel 
        isOpen={isMessagePanelOpen} 
        onClose={() => setIsMessagePanelOpen(false)} 
      />
      
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAuthModalOpen={() => {}}
      >
        {renderContent()}
      </Layout>
      
      {/* Floating Action Button for Messages */}
      {user && (
        <motion.button
          onClick={() => setIsMessagePanelOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <IoChatbubblesOutline className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default App;
