import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoLogIn, IoPersonAdd } from 'react-icons/io5';
import Modal from '../shared/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const handleSuccess = () => {
    onClose();
  };
  
  const switchToLogin = () => setIsLogin(true);
  const switchToSignup = () => setIsLogin(false);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full">
            {isLogin ? (
              <IoLogIn className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            ) : (
              <IoPersonAdd className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Join fred.ai'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isLogin 
              ? 'Sign in to connect with the Meloy Room community' 
              : 'Create your account to start collaborating'
            }
          </p>
        </div>
        
        {/* Form */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm 
              key="login"
              onSwitchToSignup={switchToSignup}
              onSuccess={handleSuccess}
            />
          ) : (
            <SignupForm 
              key="signup"
              onSwitchToLogin={switchToLogin}
              onSuccess={handleSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default AuthModal;
