import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../shared/Badge';

const ConversationList = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation,
  className = '' 
}) => {
  const { user } = useAuth();
  
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    
    // For direct messages, show the other participant's name
    if (conversation.type === 'direct' && conversation.participants) {
      const otherParticipant = conversation.participants.find(p => p !== user?.uid);
      return otherParticipant || 'Unknown User';
    }
    
    return 'Group Chat';
  };
  
  const getConversationAvatar = (conversation) => {
    const name = getConversationName(conversation);
    return name.charAt(0).toUpperCase();
  };
  
  if (!conversations || conversations.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start a conversation by messaging someone from the People tab
        </p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const hasUnread = conversation.unreadCount > 0;
        
        return (
          <motion.button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`
              w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                ${isActive 
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }
              `}>
                {getConversationAvatar(conversation)}
              </div>
              {hasUnread && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`
                  font-medium truncate
                  ${isActive ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'}
                  ${hasUnread ? 'font-semibold' : ''}
                `}>
                  {getConversationName(conversation)}
                </h3>
                <span className={`
                  text-xs flex-shrink-0 ml-2
                  ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {formatLastMessageTime(conversation.lastMessageTime)}
                </span>
              </div>
              
              <p className={`
                text-sm truncate mt-1
                ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}
                ${hasUnread ? 'font-medium' : ''}
              `}>
                {conversation.lastMessage || 'No messages yet'}
              </p>
            </div>
            
            {/* Unread Badge */}
            {hasUnread && (
              <div className="flex-shrink-0">
                <Badge variant="danger" size="sm">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ConversationList;
