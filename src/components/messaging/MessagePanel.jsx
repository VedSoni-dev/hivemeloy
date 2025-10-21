import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import Button from '../shared/Button';
import { IoAdd, IoClose, IoChatbubblesOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const MessagePanel = ({ isOpen, onClose, className = '' }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load conversations
  useEffect(() => {
    if (!user) return;
    
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = [];
      snapshot.forEach((doc) => {
        conversationsData.push({ id: doc.id, ...doc.data() });
      });
      setConversations(conversationsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConversationId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    });
    
    return () => unsubscribe();
  }, [activeConversationId]);
  
  const handleSendMessage = async (text) => {
    if (!activeConversationId || !user || !text.trim()) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: activeConversationId,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous User',
        text: text.trim(),
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update conversation's last message
      await updateDoc(doc(db, 'conversations', activeConversationId), {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const handleTyping = (isTyping) => {
    // TODO: Implement typing indicators
    console.log('User is typing:', isTyping);
  };
  
  const createDirectMessage = async (targetUserId, targetUserName) => {
    if (!user) return;
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.type === 'direct' && 
        conv.participants.includes(targetUserId) && 
        conv.participants.includes(user.uid)
      );
      
      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
        return;
      }
      
      // Create new conversation
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        participants: [user.uid, targetUserId],
        name: `${user.displayName} & ${targetUserName}`,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      setActiveConversationId(conversationRef.id);
      toast.success('Conversation started!');
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${className}`}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className="relative bg-white dark:bg-gray-800 w-full max-w-6xl mx-auto my-8 rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <IoChatbubblesOutline className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Messages
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <IoClose className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex h-[600px]">
              
              {/* Conversations Sidebar */}
              <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // TODO: Open new conversation modal
                      toast('New conversation feature coming soon!');
                    }}
                  >
                    <IoAdd className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <ConversationList
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      onSelectConversation={setActiveConversationId}
                    />
                  )}
                </div>
              </div>
              
              {/* Message Thread */}
              <div className="flex-1 flex flex-col">
                <MessageThread
                  conversation={activeConversation}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  typingUsers={typingUsers}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MessagePanel;
