import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { IoCamera, IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ProfilePicture = ({ photoURL, size = 'lg', editable = false, className = '' }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const fileInputRef = useRef(null);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewURL(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    if (!user) return;

    setUploading(true);
    try {
      // Create a reference to the file location
      const fileExtension = file.name.split('.').pop();
      const fileName = `avatar.${fileExtension}`;
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${fileName}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL
      });

      toast.success('Profile picture updated!');
      setPreviewURL(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
      setPreviewURL(null);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  const displayURL = previewURL || photoURL;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          ${sizes[size]} rounded-full overflow-hidden flex items-center justify-center
          ${displayURL ? '' : 'bg-gradient-to-br from-primary-500 to-accent-500'}
          ${editable ? 'cursor-pointer' : ''}
          ${uploading ? 'opacity-50' : ''}
        `}
        onClick={() => editable && fileInputRef.current?.click()}
        whileHover={editable ? { scale: 1.05 } : {}}
        whileTap={editable ? { scale: 0.95 } : {}}
      >
        {displayURL ? (
          <img
            src={displayURL}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-xl' : 'text-sm'}`}>
            {getInitials()}
          </span>
        )}

        {/* Upload Overlay */}
        {editable && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <IoCamera className={`${iconSizes[size]} text-white`} />
          </div>
        )}

        {/* Uploading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </motion.div>

      {/* Edit Button */}
      {editable && !uploading && (
        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IoCamera className="w-4 h-4" />
        </motion.button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePicture;

