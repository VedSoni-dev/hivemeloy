import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { IoPersonAdd, IoChatbubble, IoTime, IoCheckmarkCircle } from 'react-icons/io5';

const ActivityFeed = ({ className = '' }) => {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    // Mock activity data - in real app, this would come from Firestore
    const mockActivities = [
      {
        id: '1',
        type: 'user_joined',
        user: 'Alice Johnson',
        action: 'joined the room',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        avatar: 'A'
      },
      {
        id: '2',
        type: 'status_change',
        user: 'Bob Smith',
        action: 'changed status to "Working on AI project"',
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        avatar: 'B'
      },
      {
        id: '3',
        type: 'message',
        user: 'Eve Wilson',
        action: 'sent a message in the group chat',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        avatar: 'E'
      },
      {
        id: '4',
        type: 'collaboration',
        user: 'Charlie Brown',
        action: 'requested collaboration on "Mobile App Project"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        avatar: 'C'
      },
      {
        id: '5',
        type: 'project_update',
        user: 'Diana Prince',
        action: 'updated project "Web Dashboard"',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        avatar: 'D'
      }
    ];
    
    setActivities(mockActivities);
  }, []);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_joined':
        return <IoPersonAdd className="w-4 h-4 text-green-600" />;
      case 'status_change':
        return <IoTime className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <IoChatbubble className="w-4 h-4 text-purple-600" />;
      case 'collaboration':
        return <IoCheckmarkCircle className="w-4 h-4 text-orange-600" />;
      case 'project_update':
        return <IoCheckmarkCircle className="w-4 h-4 text-indigo-600" />;
      default:
        return <IoTime className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'user_joined':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'status_change':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'message':
        return 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'collaboration':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'project_update':
        return 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };
  
  const formatActivityTime = (timestamp) => {
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
  
  const groupActivitiesByDate = (activities) => {
    const groups = [];
    let currentGroup = null;
    
    activities.forEach((activity) => {
      const activityDate = activity.timestamp.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
      const dateKey = format(activityDate, 'yyyy-MM-dd');
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = {
          date: dateKey,
          dateHeader: isToday(activityDate) ? 'Today' : 
                     isYesterday(activityDate) ? 'Yesterday' : 
                     format(activityDate, 'EEEE, MMMM d'),
          activities: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.activities.push(activity);
    });
    
    return groups;
  };
  
  const activityGroups = groupActivitiesByDate(activities);
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          View all
        </button>
      </div>
      
      {activityGroups.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoTime className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recent activity
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Activity from room members will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activityGroups.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="flex items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {group.dateHeader}
                </h4>
              </div>
              
              {/* Activities */}
              <div className="space-y-3">
                {group.activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      flex items-start space-x-3 p-3 rounded-lg border
                      ${getActivityColor(activity.type)}
                    `}
                  >
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {activity.avatar}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
