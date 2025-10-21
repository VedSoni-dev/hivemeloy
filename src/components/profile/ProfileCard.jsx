import React from 'react';
import { motion } from 'framer-motion';
import { IoChatbubbleOutline, IoPersonOutline, IoTimeOutline } from 'react-icons/io5';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const ProfileCard = ({ 
  user, 
  onMessage, 
  onViewProfile, 
  showActions = true,
  className = '' 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Room':
        return 'success';
      case 'Online':
        return 'primary';
      case 'Away':
        return 'default';
      default:
        return 'default';
    }
  };
  
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const lastSeen = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
        p-6 hover:shadow-lg transition-all duration-200
        ${className}
      `}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user.name?.charAt(0) || user.displayName?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.name || user.displayName || 'Anonymous User'}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(user.status)} size="sm">
                {user.status || 'Away'}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatLastSeen(user.lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Info */}
      {user.project && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Working on:
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.project}
          </p>
        </div>
      )}
      
      {/* Background/Skills */}
      {user.background && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Background:
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {user.background}
          </p>
        </div>
      )}
      
      {/* Skills Tags */}
      {user.skills && user.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Skills:
          </p>
          <div className="flex flex-wrap gap-1">
            {user.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {skill}
              </Badge>
            ))}
            {user.skills.length > 3 && (
              <Badge variant="default" size="sm">
                +{user.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMessage?.(user)}
          >
            <IoChatbubbleOutline className="w-4 h-4 mr-1" />
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewProfile?.(user)}
          >
            <IoPersonOutline className="w-4 h-4 mr-1" />
            Profile
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCard;
