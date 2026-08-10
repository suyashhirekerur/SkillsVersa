import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Search, MapPin, Star, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserProfileModal from '../components/UserProfileModal';
import SwapModal from '../components/SwapModal';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile and Swap Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [selectedSwapPartner, setSelectedSwapPartner] = useState(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/matches/explore');
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load explore data');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleInitiateSwap = (partnerUser) => {
    setSelectedSwapPartner(partnerUser);
    setIsSwapModalOpen(true);
  };

  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    const nameMatch = u.name?.toLowerCase().includes(q);
    const locationMatch = u.location?.toLowerCase().includes(q);

    const teachSkills = u.skillsToTeach || u.skills?.teach || [];
    const learnSkills = u.skillsToLearn || u.skills?.learn || [];

    const teachMatch = teachSkills.some((s) => {
      const name = typeof s === 'object' ? s.name : s;
      return name?.toLowerCase().includes(q);
    });

    const learnMatch = learnSkills.some((s) => {
      const name = typeof s === 'object' ? s.name : s;
      return name?.toLowerCase().includes(q);
    });

    return nameMatch || locationMatch || teachMatch || learnMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Skills</h1>
          <p className="text-gray-400 mt-1">Discover amazing people and learn new skills.</p>
        </div>
        
        <div className="mt-4 md:mt-0 relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            placeholder="Search skills or names..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredUsers.map(user => (
            <motion.div 
              variants={itemVariants}
              key={user._id} 
              onClick={() => handleOpenProfile(user)}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-xl hover:border-primary-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-900/50 flex items-center justify-center overflow-hidden border-2 border-primary-500/30 shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary-400">{user.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors truncate">{user.name}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Star size={14} className="text-yellow-500 mr-1 shrink-0" />
                      <span>{user.rating || user.averageRating || '5.0'}</span>
                      <span className="mx-2">•</span>
                      <MapPin size={14} className="mr-1 shrink-0 text-rose-400" />
                      <span className="truncate">{user.location || 'Global'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Can Teach</h4>
                    <div className="flex flex-wrap gap-2">
                      {(user.skillsToTeach || user.skills?.teach || []).map((skill, idx) => (
                        <span key={idx} className="bg-primary-900/30 text-primary-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-primary-500/20">
                          {typeof skill === 'object' ? skill.name : skill}
                        </span>
                      ))}
                      {(!user.skillsToTeach && !user.skills?.teach || (user.skillsToTeach || user.skills?.teach || []).length === 0) && (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Wants to Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {(user.skillsToLearn || user.skills?.learn || []).map((skill, idx) => (
                        <span key={idx} className="bg-blue-900/30 text-blue-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-500/20">
                          {typeof skill === 'object' ? skill.name : skill}
                        </span>
                      ))}
                      {(!user.skillsToLearn && !user.skills?.learn || (user.skillsToLearn || user.skills?.learn || []).length === 0) && (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProfile(user);
                  }}
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors flex items-center group-hover:translate-x-1 duration-200"
                >
                  View Profile <span className="ml-1">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
          <Users size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
          <p className="text-gray-400">Try adjusting your search terms or check back later!</p>
        </div>
      )}

      {/* User Profile Detail Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedUser(null);
          }}
          onRequestSwap={(partnerUser) => handleInitiateSwap(partnerUser)}
        />
      )}

      {/* Swap Request Modal */}
      {selectedSwapPartner && (
        <SwapModal
          partner={selectedSwapPartner}
          isOpen={isSwapModalOpen}
          onClose={() => {
            setIsSwapModalOpen(false);
            setSelectedSwapPartner(null);
          }}
        />
      )}
    </div>
  );
}

