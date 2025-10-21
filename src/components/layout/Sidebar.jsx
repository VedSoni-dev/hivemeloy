import React from 'react';
import { motion } from 'framer-motion';
import { 
  IoHomeOutline, 
  IoChatbubblesOutline, 
  IoPeopleOutline, 
  IoSettingsOutline,
  IoAnalyticsOutline,
  IoSearchOutline
} from 'react-icons/io5';

const Sidebar = ({ activeTab, onTabChange, user }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: IoHomeOutline },
    { id: 'messages', label: 'Messages', icon: IoChatbubblesOutline },
    { id: 'people', label: 'People', icon: IoPeopleOutline },
    { id: 'projects', label: 'Projects', icon: IoAnalyticsOutline },
    { id: 'search', label: 'Search', icon: IoSearchOutline },
    { id: 'settings', label: 'Settings', icon: IoSettingsOutline }
  ];
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
      
      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.displayName || 'Anonymous User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
