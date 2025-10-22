import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoClose, IoSparkles, IoChatbubbleEllipses } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Button from '../shared/Button';
import ProfileCard from '../profile/ProfileCard';

const AIChatInterface = ({ isMinimized, onToggleMinimize, onUserSelect, allUsers = [] }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setTimeout(() => {
        addAIMessage(
          `👋 Hi ${user?.displayName || 'there'}! I'm fred.ai, your intelligent assistant for the Meloy Room.\n\nI can help you:\n• Find collaborators for your projects\n• Connect with people who have specific skills\n• Discover people with shared interests\n• Analyze your network\n\nTry asking: "Find someone to help with my robotics project" or "Who knows React?"`
        );
      }, 500);
    }
  }, []);

  const addAIMessage = (content, matches = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'ai',
      content,
      matches,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const findMatches = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Extract keywords
    const isLookingForSkill = lowerQuery.includes('who knows') || lowerQuery.includes('who has') || lowerQuery.includes('expert in');
    const isLookingForCollaborator = lowerQuery.includes('collaborate') || lowerQuery.includes('co-founder') || lowerQuery.includes('partner') || lowerQuery.includes('startup');
    const isLookingForInterest = lowerQuery.includes('interested in') || lowerQuery.includes('working on');
    
    // Common skill keywords
    const skillKeywords = ['react', 'python', 'javascript', 'ai', 'ml', 'machine learning', 'robotics', 'hardware', 'design', 'marketing', 'backend', 'frontend'];
    const interestKeywords = ['climate', 'fintech', 'edtech', 'health', 'robotics', 'ai', 'web3', 'crypto'];
    
    let matches = [];
    
    if (isLookingForSkill) {
      // Find users with matching skills
      const skill = skillKeywords.find(k => lowerQuery.includes(k));
      if (skill) {
        matches = allUsers.filter(u => 
          u.skills?.some(s => s.toLowerCase().includes(skill)) ||
          u.background?.toLowerCase().includes(skill) ||
          u.project?.toLowerCase().includes(skill)
        );
      }
    } else if (isLookingForCollaborator) {
      // Find users looking for collaboration
      matches = allUsers.filter(u => 
        u.lookingForCollaborators ||
        u.status === 'In Room' // Prioritize people in room
      );
      
      // Sort by shared interests/skills
      const userInterests = query.match(/(robotics|ai|climate|fintech|web3|design|marketing)/gi) || [];
      matches.sort((a, b) => {
        const aScore = userInterests.filter(i => 
          a.project?.toLowerCase().includes(i.toLowerCase()) ||
          a.background?.toLowerCase().includes(i.toLowerCase())
        ).length;
        const bScore = userInterests.filter(i => 
          b.project?.toLowerCase().includes(i.toLowerCase()) ||
          b.background?.toLowerCase().includes(i.toLowerCase())
        ).length;
        return bScore - aScore;
      });
    } else if (isLookingForInterest) {
      // Find users with matching interests
      const interest = interestKeywords.find(k => lowerQuery.includes(k));
      if (interest) {
        matches = allUsers.filter(u =>
          u.project?.toLowerCase().includes(interest) ||
          u.background?.toLowerCase().includes(interest) ||
          u.bio?.toLowerCase().includes(interest)
        );
      }
    } else {
      // General search - match any field
      matches = allUsers.filter(u =>
        u.name?.toLowerCase().includes(lowerQuery) ||
        u.project?.toLowerCase().includes(lowerQuery) ||
        u.background?.toLowerCase().includes(lowerQuery) ||
        u.bio?.toLowerCase().includes(lowerQuery) ||
        u.skills?.some(s => s.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Filter out current user
    matches = matches.filter(u => u.uid !== user?.uid);
    
    return matches.slice(0, 5); // Top 5 matches
  };

  const generateAIResponse = (query, matches) => {
    if (matches.length === 0) {
      return "I couldn't find anyone matching that criteria right now. Try:\n• Being more specific about skills or interests\n• Asking about broader topics\n• Checking back later as new people join";
    }

    const responseIntros = [
      `I found ${matches.length} ${matches.length === 1 ? 'person' : 'people'} who might be a great match:`,
      `Great news! I discovered ${matches.length} potential ${matches.length === 1 ? 'connection' : 'connections'}:`,
      `Here ${matches.length === 1 ? 'is' : 'are'} ${matches.length} ${matches.length === 1 ? 'person' : 'people'} I think you should meet:`,
    ];

    return responseIntros[Math.floor(Math.random() * responseIntros.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuery = input.trim();
    addUserMessage(userQuery);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const matches = findMatches(userQuery);
      const response = generateAIResponse(userQuery, matches);
      
      setIsTyping(false);
      addAIMessage(response, matches);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQueries = [
    "Find someone to help with my robotics project",
    "Who knows React and is available?",
    "Connect me with someone in climate tech",
    "Who's looking for a co-founder?",
    "Show me people in the room right now"
  ];

  if (isMinimized) {
    return (
      <motion.button
        onClick={onToggleMinimize}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <IoSparkles className="w-7 h-7" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="flex items-center space-x-2">
          <IoSparkles className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">Chat with fred.ai</h3>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <IoClose className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-2xl px-4 py-2`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {/* Show matches if any */}
            {message.matches && message.matches.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.matches.map((match) => (
                  <motion.div
                    key={match.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onUserSelect?.(match)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {match.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {match.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {match.project || match.background}
                        </p>
                        {match.skills && match.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.slice(0, 3).map((query, i) => (
              <button
                key={i}
                onClick={() => setInput(query)}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask fred.ai anything..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
            rows={1}
            style={{ maxHeight: '80px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2"
          >
            <IoSend className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIChatInterface;
