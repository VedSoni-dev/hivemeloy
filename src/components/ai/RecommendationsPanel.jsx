import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IoSparkles, IoClose, IoPeople, IoGitBranch } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { findMatches, analyzeUserRole, clusterCommunities } from '../../utils/aiMatchingEngine';
import ProfileCard from '../profile/ProfileCard';
import Badge from '../shared/Badge';

const RecommendationsPanel = ({ users = [], onUserSelect, onClose }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [userAnalysis, setUserAnalysis] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    if (!user || !users.length) return;

    // Find current user profile
    const currentUserProfile = users.find(u => u.uid === user.uid);
    if (!currentUserProfile) return;

    // Get recommendations
    const matches = findMatches(currentUserProfile, users, 8);
    setRecommendations(matches);

    // Analyze user role
    const analysis = analyzeUserRole(currentUserProfile, users);
    setUserAnalysis(analysis);

    // Cluster communities
    const clusters = clusterCommunities(users, 35);
    setCommunities(clusters);
  }, [user, users]);

  return (
    <motion.div
      className="fixed top-20 right-4 w-96 max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col z-30"
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <IoSparkles className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">AI Recommendations</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <IoClose className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'matches', label: 'For You', icon: IoSparkles },
            { id: 'communities', label: 'Communities', icon: IoPeople },
            { id: 'insights', label: 'Your Role', icon: IoGitBranch }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                People You Should Meet
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Based on your skills, interests, and collaboration goals
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((match, index) => (
                  <motion.div
                    key={match.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary-300 dark:hover:border-primary-700"
                    onClick={() => onUserSelect(match)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {match.name?.charAt(0) || 'U'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {match.name}
                          </h5>
                          <Badge variant="primary" size="sm">
                            {match.score}% match
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {match.project || match.background || 'No description'}
                        </p>

                        {/* Match Reasons */}
                        {match.reasons && match.reasons.length > 0 && (
                          <div className="space-y-1">
                            {match.reasons.slice(0, 2).map((reason, i) => (
                              <div key={i} className="flex items-start gap-1">
                                <IoSparkles className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IoSparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recommendations yet. Complete your profile to get better matches!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'communities' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Network Communities
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Groups of people with shared interests
              </p>
            </div>

            {communities.length > 0 ? (
              <div className="space-y-3">
                {communities.slice(0, 5).map((community, index) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        Community #{index + 1}
                      </h5>
                      <Badge variant="secondary" size="sm">
                        {community.members.length} members
                      </Badge>
                    </div>

                    {/* Member Avatars */}
                    <div className="flex -space-x-2 mb-3">
                      {community.members.slice(0, 5).map((member, i) => (
                        <div
                          key={member.uid}
                          className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                          title={member.name}
                        >
                          <span className="text-white font-bold text-xs">
                            {member.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      ))}
                      {community.members.length > 5 && (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">
                            +{community.members.length - 5}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Common Skills */}
                    {community.commonSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {community.commonSkills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IoPeople className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Not enough users to form communities yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && userAnalysis && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Your Network Role
              </h4>
            </div>

            {/* Role Badge */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-3 mb-2">
                <IoGitBranch className="w-8 h-8 text-primary-600" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {userAnalysis.role}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your network position
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {userAnalysis.summary}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userAnalysis.totalConnections}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Connections</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">
                  {userAnalysis.strongConnections}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Strong Matches</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">
                  {userAnalysis.mediumConnections}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Medium Matches</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-500">
                  {userAnalysis.weakConnections}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Weak Connections</p>
              </div>
            </div>

            {/* Unique Skills */}
            {userAnalysis.uniqueSkills?.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  Your Unique Value
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Skills that make you stand out:
                </p>
                <div className="flex flex-wrap gap-2">
                  {userAnalysis.uniqueSkills.map((skill, i) => (
                    <Badge key={i} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendationsPanel;
