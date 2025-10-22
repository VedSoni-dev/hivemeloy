import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { IoClose, IoSearch, IoFilter } from 'react-icons/io5';
import Button from '../shared/Button';
import Badge from '../shared/Badge';

const SocialGraph = ({ users = [], onNodeClick, isOpen, onClose }) => {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  // Build graph data
  useEffect(() => {
    if (!users || users.length === 0) return;

    // Create nodes
    const nodes = users.map(u => ({
      id: u.uid,
      name: u.name || 'Anonymous',
      status: u.status || 'Away',
      skills: u.skills || [],
      project: u.project || '',
      background: u.background || '',
      photoURL: u.photoURL,
      val: u.status === 'In Room' ? 15 : u.status === 'Online' ? 10 : 5
    }));

    // Create links based on shared interests/skills
    const links = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const userA = users[i];
        const userB = users[j];
        
        // Calculate connection strength
        let strength = 0;
        
        // Shared skills
        const sharedSkills = (userA.skills || []).filter(s => 
          (userB.skills || []).includes(s)
        ).length;
        strength += sharedSkills * 2;
        
        // Similar projects/interests
        if (userA.project && userB.project) {
          const wordsA = userA.project.toLowerCase().split(' ');
          const wordsB = userB.project.toLowerCase().split(' ');
          const commonWords = wordsA.filter(w => wordsB.includes(w) && w.length > 3).length;
          strength += commonWords;
        }
        
        // Both looking for collaborators
        if (userA.lookingForCollaborators && userB.lookingForCollaborators) {
          strength += 3;
        }
        
        // Same status (both in room, etc)
        if (userA.status === userB.status && userA.status === 'In Room') {
          strength += 2;
        }
        
        // Create link if there's any connection
        if (strength > 0) {
          links.push({
            source: userA.uid,
            target: userB.uid,
            value: strength,
            distance: 100 / strength // Closer for stronger connections
          });
        }
      }
    }

    setGraphData({ nodes, links });
  }, [users]);

  // Filter nodes based on status and search
  const filteredGraphData = useMemo(() => {
    if (!graphData.nodes) return { nodes: [], links: [] };

    let filteredNodes = graphData.nodes;

    // Filter by status
    if (filterStatus !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.skills.some(s => s.toLowerCase().includes(query)) ||
        n.project.toLowerCase().includes(query) ||
        n.background.toLowerCase().includes(query)
      );
    }

    // Filter links to only include filtered nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l =>
      nodeIds.has(l.source.id || l.source) &&
      nodeIds.has(l.target.id || l.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filterStatus, searchQuery]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    onNodeClick?.(users.find(u => u.uid === node.id));

    // Highlight connected nodes
    const connectedNodeIds = new Set();
    const connectedLinkIds = new Set();
    
    graphData.links.forEach(link => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      
      if (sourceId === node.id) {
        connectedNodeIds.add(targetId);
        connectedLinkIds.add(link);
      } else if (targetId === node.id) {
        connectedNodeIds.add(sourceId);
        connectedLinkIds.add(link);
      }
    });

    connectedNodeIds.add(node.id);
    setHighlightNodes(connectedNodeIds);
    setHighlightLinks(connectedLinkIds);
  }, [graphData.links, users, onNodeClick]);

  const getNodeColor = (node) => {
    if (node.id === user?.uid) return '#8B5CF6'; // Purple for current user
    
    switch (node.status) {
      case 'In Room':
        return '#10B981'; // Green
      case 'Online':
        return '#3B82F6'; // Blue
      case 'Away':
        return '#6B7280'; // Gray
      default:
        return '#9CA3AF';
    }
  };

  const getLinkColor = (link) => {
    const strength = link.value || 1;
    if (strength > 5) return 'rgba(59, 130, 246, 0.6)'; // Strong connection - blue
    if (strength > 2) return 'rgba(59, 130, 246, 0.4)'; // Medium connection
    return 'rgba(156, 163, 175, 0.2)'; // Weak connection - gray
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Meloy Room Social Graph
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredGraphData.nodes.length} people, {filteredGraphData.links.length} connections
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IoClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4">
            {/* Search */}
            <div className="flex-1 relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skills, or project..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'In Room', 'Online', 'Away'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="w-full h-full pt-32">
          {filteredGraphData.nodes.length > 0 ? (
            <ForceGraph2D
              graphData={filteredGraphData}
              nodeLabel={(node) => `
                <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px;">
                  <strong>${node.name}</strong><br/>
                  ${node.status}<br/>
                  ${node.skills.slice(0, 3).join(', ')}
                </div>
              `}
              nodeColor={getNodeColor}
              nodeRelSize={6}
              nodeVal={(node) => node.val}
              linkColor={getLinkColor}
              linkWidth={(link) => Math.sqrt(link.value || 1)}
              linkDirectionalParticles={(link) => link.value > 5 ? 2 : 0}
              linkDirectionalParticleWidth={2}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                
                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI);
                ctx.fillStyle = highlightNodes.size === 0 || highlightNodes.has(node.id)
                  ? getNodeColor(node)
                  : 'rgba(156, 163, 175, 0.3)';
                ctx.fill();
                
                // Draw border for current user
                if (node.id === user?.uid) {
                  ctx.strokeStyle = '#8B5CF6';
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                }
                
                // Draw label
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = highlightNodes.size === 0 || highlightNodes.has(node.id)
                  ? '#374151'
                  : 'rgba(107, 114, 128, 0.5)';
                ctx.fillText(label, node.x, node.y + (node.val || 5) + fontSize);
              }}
              linkCanvasObject={(link, ctx) => {
                if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
                  return; // Don't draw non-highlighted links when highlighting
                }
                
                const start = link.source;
                const end = link.target;
                
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = getLinkColor(link);
                ctx.lineWidth = Math.sqrt(link.value || 1);
                ctx.stroke();
              }}
              cooldownTicks={100}
              onEngineStop={() => {
                // Zoom to fit
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">No users match your filters</p>
                <Button onClick={() => { setFilterStatus('all'); setSearchQuery(''); }} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">In Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Away</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-purple-600"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">You</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Node size:</strong> Activity level<br/>
              <strong>Link thickness:</strong> Connection strength<br/>
              <strong>Click</strong> a node to see details
            </p>
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            className="absolute top-32 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ backgroundColor: getNodeColor(selectedNode) }}>
                  <span className="text-white font-bold">{selectedNode.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedNode.name}</h4>
                  <Badge variant={selectedNode.status === 'In Room' ? 'success' : selectedNode.status === 'Online' ? 'primary' : 'default'} size="sm">
                    {selectedNode.status}
                  </Badge>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                <IoClose className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.project && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Project</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedNode.project}</p>
              </div>
            )}

            {selectedNode.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full mt-4"
              size="sm"
              onClick={() => {
                const user = users.find(u => u.uid === selectedNode.id);
                onNodeClick?.(user);
              }}
            >
              View Full Profile
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SocialGraph;
