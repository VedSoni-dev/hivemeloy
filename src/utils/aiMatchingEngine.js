/**
 * AI-Powered Matching Engine for Social Graph
 * Calculates compatibility scores and generates recommendations
 */

/**
 * Calculate similarity score between two users based on multiple factors
 * @param {Object} userA - First user profile
 * @param {Object} userB - Second user profile
 * @returns {number} Similarity score (0-100)
 */
export const calculateSimilarity = (userA, userB) => {
  let score = 0;
  let maxScore = 0;

  // 1. Skill Overlap (25 points max)
  maxScore += 25;
  if (userA.skills?.length && userB.skills?.length) {
    const skillsA = userA.skills.map(s => s.toLowerCase());
    const skillsB = userB.skills.map(s => s.toLowerCase());
    const sharedSkills = skillsA.filter(s => skillsB.includes(s));
    const totalSkills = new Set([...skillsA, ...skillsB]).size;
    
    if (totalSkills > 0) {
      score += (sharedSkills.length / totalSkills) * 25;
    }
  }

  // 2. Project/Interest Similarity (30 points max)
  maxScore += 30;
  if (userA.project && userB.project) {
    const wordsA = tokenize(userA.project);
    const wordsB = tokenize(userB.project);
    const commonWords = wordsA.filter(w => wordsB.includes(w));
    
    if (commonWords.length > 0) {
      score += Math.min((commonWords.length / Math.max(wordsA.length, wordsB.length)) * 30, 30);
    }
  }

  // 3. Background Similarity (20 points max)
  maxScore += 20;
  if (userA.background && userB.background) {
    const bgA = tokenize(userA.background);
    const bgB = tokenize(userB.background);
    const commonBg = bgA.filter(w => bgB.includes(w));
    
    if (commonBg.length > 0) {
      score += Math.min((commonBg.length / Math.max(bgA.length, bgB.length)) * 20, 20);
    }
  }

  // 4. Bio/Description Similarity (15 points max)
  maxScore += 15;
  if (userA.bio && userB.bio) {
    const bioA = tokenize(userA.bio);
    const bioB = tokenize(userB.bio);
    const commonBio = bioA.filter(w => bioB.includes(w));
    
    if (commonBio.length > 0) {
      score += Math.min((commonBio.length / Math.max(bioA.length, bioB.length)) * 15, 15);
    }
  }

  // 5. Collaboration Intent (10 points max)
  maxScore += 10;
  if (userA.lookingForCollaborators && userB.lookingForCollaborators) {
    score += 10;
  } else if (userA.lookingForCollaborators || userB.lookingForCollaborators) {
    score += 5;
  }

  // Normalize score to 0-100
  return Math.round((score / maxScore) * 100);
};

/**
 * Tokenize text into meaningful words (filters stop words and short words)
 * @param {string} text - Input text
 * @returns {string[]} Array of meaningful words
 */
const tokenize = (text) => {
  if (!text) return [];
  
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by']);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 3 && !stopWords.has(word)); // Filter meaningful words
};

/**
 * Find best matches for a user based on their profile
 * @param {Object} currentUser - User to find matches for
 * @param {Object[]} allUsers - Array of all user profiles
 * @param {number} limit - Max number of recommendations
 * @returns {Object[]} Array of recommended users with scores
 */
export const findMatches = (currentUser, allUsers, limit = 5) => {
  if (!currentUser || !allUsers) return [];
  
  const matches = allUsers
    .filter(u => u.uid !== currentUser.uid) // Exclude self
    .map(user => ({
      ...user,
      score: calculateSimilarity(currentUser, user),
      reasons: getMatchReasons(currentUser, user)
    }))
    .filter(m => m.score > 10) // Only show matches with >10% compatibility
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit);

  return matches;
};

/**
 * Generate human-readable reasons for a match
 * @param {Object} userA - First user
 * @param {Object} userB - Second user
 * @returns {string[]} Array of match reasons
 */
export const getMatchReasons = (userA, userB) => {
  const reasons = [];

  // Shared skills
  if (userA.skills?.length && userB.skills?.length) {
    const skillsA = userA.skills.map(s => s.toLowerCase());
    const skillsB = userB.skills.map(s => s.toLowerCase());
    const shared = userA.skills.filter(s => skillsB.includes(s.toLowerCase()));
    
    if (shared.length > 0) {
      reasons.push(`Shared skills: ${shared.slice(0, 3).join(', ')}`);
    }
  }

  // Similar projects
  if (userA.project && userB.project) {
    const wordsA = tokenize(userA.project);
    const wordsB = tokenize(userB.project);
    const common = wordsA.filter(w => wordsB.includes(w));
    
    if (common.length > 1) {
      reasons.push(`Similar project interests`);
    }
  }

  // Both looking for collaborators
  if (userA.lookingForCollaborators && userB.lookingForCollaborators) {
    reasons.push('Both looking for collaborators');
  }

  // Same status (in room)
  if (userA.status === 'In Room' && userB.status === 'In Room') {
    reasons.push('Both currently in the Meloy Room');
  }

  // Complementary skills (userA needs something userB has)
  if (userA.lookingFor?.length && userB.skills?.length) {
    const needed = userA.lookingFor.map(s => s.toLowerCase());
    const available = userB.skills.map(s => s.toLowerCase());
    const matches = needed.filter(n => available.includes(n));
    
    if (matches.length > 0) {
      reasons.push(`Has skills you're looking for: ${matches.slice(0, 2).join(', ')}`);
    }
  }

  return reasons.length > 0 ? reasons : ['Potential collaboration opportunity'];
};

/**
 * Cluster users into communities based on similarity
 * @param {Object[]} users - Array of all users
 * @param {number} threshold - Minimum similarity score for same community (0-100)
 * @returns {Object[]} Array of communities
 */
export const clusterCommunities = (users, threshold = 40) => {
  if (!users || users.length === 0) return [];

  const communities = [];
  const assigned = new Set();

  users.forEach(user => {
    if (assigned.has(user.uid)) return;

    // Start a new community
    const community = {
      id: `community-${communities.length}`,
      members: [user],
      commonSkills: [...(user.skills || [])],
      commonInterests: tokenize(user.project + ' ' + user.background)
    };

    assigned.add(user.uid);

    // Find similar users
    users.forEach(otherUser => {
      if (assigned.has(otherUser.uid)) return;
      
      const similarity = calculateSimilarity(user, otherUser);
      if (similarity >= threshold) {
        community.members.push(otherUser);
        assigned.add(otherUser.uid);

        // Update common skills
        if (otherUser.skills) {
          community.commonSkills = community.commonSkills.filter(s =>
            otherUser.skills.some(os => os.toLowerCase() === s.toLowerCase())
          );
        }
      }
    });

    if (community.members.length > 0) {
      communities.push(community);
    }
  });

  return communities.sort((a, b) => b.members.length - a.members.length);
};

/**
 * Generate a summary of a user's role in the network
 * @param {Object} user - User to analyze
 * @param {Object[]} allUsers - All users in network
 * @returns {Object} Summary with role, connections, etc.
 */
export const analyzeUserRole = (user, allUsers) => {
  const connections = allUsers
    .filter(u => u.uid !== user.uid)
    .map(u => ({
      user: u,
      score: calculateSimilarity(user, u)
    }))
    .filter(c => c.score > 20);

  const strongConnections = connections.filter(c => c.score > 60).length;
  const mediumConnections = connections.filter(c => c.score >= 40 && c.score <= 60).length;
  const weakConnections = connections.filter(c => c.score >= 20 && c.score < 40).length;

  // Determine role based on connection pattern
  let role = 'Newcomer';
  if (strongConnections > 5) {
    role = 'Core Connector';
  } else if (strongConnections > 2) {
    role = 'Active Member';
  } else if (connections.length > 5) {
    role = 'Bridge Builder';
  }

  // Find unique value proposition
  const uniqueSkills = user.skills?.filter(skill => {
    const othersWithSkill = allUsers.filter(u => 
      u.uid !== user.uid && u.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    return othersWithSkill < 2; // Skill that < 2 other people have
  }) || [];

  return {
    role,
    totalConnections: connections.length,
    strongConnections,
    mediumConnections,
    weakConnections,
    uniqueSkills,
    summary: generateRoleSummary(role, user, connections.length, uniqueSkills)
  };
};

/**
 * Generate human-readable role summary
 */
const generateRoleSummary = (role, user, connectionCount, uniqueSkills) => {
  const name = user.name || 'This user';
  
  const summaries = {
    'Core Connector': `${name} is a highly connected member with strong ties to many people in the network. They're likely a key figure for collaboration and knowledge sharing.`,
    'Active Member': `${name} has solid connections in the network and actively collaborates with others.`,
    'Bridge Builder': `${name} connects with many people across different groups, making them valuable for introducing people.`,
    'Newcomer': `${name} is relatively new or has niche interests. Great opportunity to help them connect!`
  };

  let summary = summaries[role] || summaries['Newcomer'];
  
  if (uniqueSkills.length > 0) {
    summary += ` They have unique expertise in ${uniqueSkills.slice(0, 2).join(' and ')}.`;
  }

  return summary;
};

export default {
  calculateSimilarity,
  findMatches,
  getMatchReasons,
  clusterCommunities,
  analyzeUserRole
};
