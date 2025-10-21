import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import MessageInput from './MessageInput';

const MessageThread = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  onTyping,
  typingUsers = [],
  className = '' 
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom();
    }
  }, [messages, isScrolledUp]);
  
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledUp(!isAtBottom);
  };
  
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  const formatDateHeader = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };
  
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message) => {
      const messageDate = message.timestamp?.toDate ? message.timestamp.toDate() : new Date(message.timestamp);
      const dateKey = format(messageDate, 'yyyy-MM-dd');
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = {
          date: dateKey,
          dateHeader: formatDateHeader(message.timestamp),
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };
  
  if (!conversation) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }
  
  const messageGroups = groupMessagesByDate(messages);
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      
      {/* Conversation Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {conversation.name?.charAt(0) || 'G'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {conversation.name || 'Group Chat'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation.type === 'group' ? 'Group conversation' : 'Direct message'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {group.dateHeader}
                </span>
              </div>
            </div>
            
            {/* Messages in this date group */}
            {group.messages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.uid;
              const showAvatar = index === 0 || group.messages[index - 1].senderId !== message.senderId;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {message.senderName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {!isOwnMessage && showAvatar && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {message.senderName || 'Unknown User'}
                        </span>
                      )}
                      
                      <div className={`
                        px-4 py-2 rounded-2xl max-w-full break-words
                        ${isOwnMessage 
                          ? 'bg-primary-600 text-white rounded-br-md' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                        }
                      `}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                      
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm">💬</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          placeholder={`Message ${conversation.name || 'group'}...`}
        />
      </div>
    </div>
  );
};

export default MessageThread;
