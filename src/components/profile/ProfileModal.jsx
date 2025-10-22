import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Badge from '../shared/Badge';
import ProfilePicture from './ProfilePicture';
import { IoClose, IoLogoGithub, IoLogoLinkedin, IoLogoTwitter, IoLink } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, userProfile, isOwnProfile = false }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    background: '',
    bio: '',
    skills: [],
    lookingForCollaborators: false,
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        project: userProfile.project || '',
        background: userProfile.background || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || [],
        lookingForCollaborators: userProfile.lookingForCollaborators || false,
        socialLinks: userProfile.socialLinks || {
          github: '',
          linkedin: '',
          twitter: '',
          website: ''
        }
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        ...formData,
        lastUpdated: serverTimestamp()
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && formData.skills.length < 10) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  if (!userProfile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Profile' : userProfile.name || 'User Profile'}
      size="lg"
    >
      <div className="space-y-6">
        
        {/* Profile Picture */}
        <div className="flex justify-center">
          <ProfilePicture
            photoURL={userProfile.photoURL}
            size="xl"
            editable={isOwnProfile && isEditing}
          />
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />

            <Input
              label="Current Project"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              placeholder="What are you working on?"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <Input
              label="Background/Expertise"
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              placeholder="Your skills and expertise"
            />

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                  className="flex-1"
                />
                <Button onClick={addSkill} size="sm" disabled={!newSkill.trim() || formData.skills.length >= 10}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(index)} className="ml-1 hover:text-red-600">
                      <IoClose className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.skills.length}/10 skills
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Social Links
              </label>
              
              <div className="flex items-center gap-2">
                <IoLogoGithub className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Input
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                  })}
                  placeholder="github.com/username"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <IoLogoLinkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Input
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="linkedin.com/in/username"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <IoLogoTwitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Input
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="twitter.com/username"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <IoLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Input
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, website: e.target.value }
                  })}
                  placeholder="yourwebsite.com"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Looking for Collaborators Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Looking for collaborators</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Show that you're open to collaboration</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, lookingForCollaborators: !formData.lookingForCollaborators })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.lookingForCollaborators ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.lookingForCollaborators ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={loading}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={
                  userProfile.status === 'In Room' ? 'success' :
                  userProfile.status === 'Online' ? 'primary' : 'default'
                }
                size="lg"
              >
                {userProfile.status || 'Away'}
              </Badge>
            </div>

            {/* Bio */}
            {formData.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400">{formData.bio}</p>
              </div>
            )}

            {/* Current Project */}
            {formData.project && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Project</h3>
                <p className="text-gray-600 dark:text-gray-400">{formData.project}</p>
              </div>
            )}

            {/* Background */}
            {formData.background && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background</h3>
                <p className="text-gray-600 dark:text-gray-400">{formData.background}</p>
              </div>
            )}

            {/* Skills */}
            {formData.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {Object.values(formData.socialLinks).some(link => link) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connect</h3>
                <div className="flex gap-3">
                  {formData.socialLinks.github && (
                    <a href={`https://${formData.socialLinks.github}`} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <IoLogoGithub className="w-6 h-6" />
                    </a>
                  )}
                  {formData.socialLinks.linkedin && (
                    <a href={`https://${formData.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <IoLogoLinkedin className="w-6 h-6" />
                    </a>
                  )}
                  {formData.socialLinks.twitter && (
                    <a href={`https://${formData.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <IoLogoTwitter className="w-6 h-6" />
                    </a>
                  )}
                  {formData.socialLinks.website && (
                    <a href={`https://${formData.socialLinks.website}`} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <IoLink className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Collaboration Badge */}
            {formData.lookingForCollaborators && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-400 font-medium">🤝 Open to collaboration</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              {isOwnProfile && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;

