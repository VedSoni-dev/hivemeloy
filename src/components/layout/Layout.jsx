import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import AuthModal from '../auth/AuthModal';

const Layout = ({ children, activeTab, onTabChange, onAuthModalOpen, onGraphOpen }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleAuthModalOpen = () => {
    setIsAuthModalOpen(true);
    onAuthModalOpen?.();
  };
  const handleAuthModalClose = () => setIsAuthModalOpen(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      
      {/* Header */}
      <Header 
        onAuthModalOpen={handleAuthModalOpen} 
        onGraphOpen={onGraphOpen}
      />
      
      {/* Main Content */}
      <div className="flex flex-1">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={onTabChange}
        />
        
        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose} 
      />
    </div>
  );
};

export default Layout;
