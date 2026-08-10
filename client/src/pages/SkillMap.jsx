import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Zap, CheckCircle, ArrowRight, Compass, Award } from 'lucide-react';

const SKILL_NODES = [
  { id: 'html-css', label: 'HTML & CSS', category: 'Development', color: 'bg-orange-500', connections: ['javascript', 'ui-design'], description: 'Fundamental building blocks of modern web page layout and design.' },
  { id: 'javascript', label: 'JavaScript', category: 'Development', color: 'bg-yellow-500', connections: ['react', 'node-js', 'typescript'], description: 'Core programming language of the web for dynamic applications.' },
  { id: 'react', label: 'React.js', category: 'Development', color: 'bg-cyan-500', connections: ['next-js', 'frontend-master'], quizId: 'react-dev', description: 'Popular declarative component framework for high-performance UIs.' },
  { id: 'node-js', label: 'Node.js & Express', category: 'Development', color: 'bg-emerald-500', connections: ['mongodb', 'fullstack'], description: 'Server-side JavaScript runtime for scalable backend APIs.' },
  { id: 'python', label: 'Python Core', category: 'Development', color: 'bg-blue-500', connections: ['data-science', 'django', 'ai-ml'], quizId: 'python-core', description: 'Versatile language for automation, backend APIs, and data science.' },
  { id: 'data-science', label: 'Data Science & Pandas', category: 'Development', color: 'bg-purple-500', connections: ['ai-ml'], quizId: 'data-science', description: 'Analyzing structured datasets, statistical modeling, and visualization.' },
  { id: 'ui-design', label: 'UI/UX Design', category: 'Design', color: 'bg-rose-500', connections: ['figma', 'react'], quizId: 'ui-ux-design', description: 'User-centric wireframing, typography, contrast, and interactive prototyping.' },
  { id: 'figma', label: 'Figma Prototyping', category: 'Design', color: 'bg-pink-500', connections: ['ui-design'], description: 'Collaborative vector graphic design and design system architecture.' },
];

export default function SkillMap() {
  const [selectedNode, setSelectedNode] = useState(SKILL_NODES[2]); // Default React

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
        >
          <Map size={16} />
          <span>Interactive Skill Network Graph</span>
        </motion.div>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Skill Map & Learning Paths 🗺️
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
          Explore how skills connect across SkillsVersa. Click any skill node to reveal learning prerequisites, related domains, and verification quizzes!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Visual Graph Canvas */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/90 via-purple-950/30 to-gray-900/90 rounded-3xl p-6 border border-white/10 shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Compass size={18} className="text-cyan-400" />
              <span className="font-bold">Connected Skill Graph</span>
            </div>
            <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400">Click nodes to inspect</span>
          </div>

          {/* Connected SVG lines representation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
            <line x1="150" y1="120" x2="320" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="320" y1="120" x2="480" y2="180" stroke="#38bdf8" strokeWidth="2" />
            <line x1="320" y1="120" x2="320" y2="280" stroke="#38bdf8" strokeWidth="2" />
            <line x1="150" y1="320" x2="320" y2="280" stroke="#f43f5e" strokeWidth="2" />
            <line x1="150" y1="200" x2="320" y2="280" stroke="#a855f7" strokeWidth="2" />
          </svg>

          {/* Skill Nodes Container Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 py-6">
            {SKILL_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <motion.button
                  key={node.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-primary-600/30 border-primary-400 shadow-lg shadow-primary-500/20 ring-2 ring-primary-500' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${node.color} mb-3 shadow-md`} />
                  <h4 className="font-bold text-white text-sm">{node.label}</h4>
                  <span className="text-[11px] text-gray-400 capitalize">{node.category}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="text-xs text-gray-500 italic mt-auto border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Interconnected learning paths based on platform activity</span>
            <span className="text-cyan-400 font-semibold">8 Core Nodes</span>
          </div>
        </div>

        {/* Selected Skill Details Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${selectedNode.color}`} />
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">{selectedNode.category}</span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">{selectedNode.label}</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">{selectedNode.description}</p>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Connected Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.connections.map((conn) => (
                    <span key={conn} className="bg-white/10 border border-white/15 text-gray-200 text-xs px-3 py-1 rounded-full font-medium capitalize">
                      {conn.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            {selectedNode.quizId ? (
              <Link to={`/quizzes`}>
                <button className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary-600/30 hover:scale-[1.02] transition-transform">
                  <Award size={18} />
                  <span>Verify Skill & Earn Badge</span>
                </button>
              </Link>
            ) : (
              <Link to="/explore">
                <button className="w-full bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 border border-white/20 hover:bg-white/20 transition-colors">
                  <span>Find Mentors for {selectedNode.label}</span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
