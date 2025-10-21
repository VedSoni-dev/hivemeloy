import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoSend } from 'react-icons/io5';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  placeholder = "Type a message...", 
  disabled = false,
  className = '' 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };
  
  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    // Clear typing indicator after user stops typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <form onSubmit={handleSubmit} className={`flex items-end space-x-3 ${className}`}>
      <div className="flex-1">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 
              rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 
              focus:border-transparent bg-white dark:bg-gray-700 
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          
          <motion.button
            type="submit"
            disabled={!message.trim() || disabled}
            className="
              absolute right-2 bottom-2 p-2 rounded-lg
              bg-primary-600 text-white hover:bg-primary-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
            whileHover={{ scale: disabled || !message.trim() ? 1 : 1.05 }}
            whileTap={{ scale: disabled || !message.trim() ? 1 : 0.95 }}
          >
            <IoSend className="w-4 h-4" />
          </motion.button>
        </div>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400"
          >
            Typing...
          </motion.div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
