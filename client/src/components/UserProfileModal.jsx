import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  MapPin, 
  Star, 
  GraduationCap, 
  BookOpen, 
  Zap, 
  Award, 
  Calendar,
  MessageSquare,
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserProfileModal({ user: initialUser, userId, isOpen, onClose, onRequestSwap }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFullProfile = async () => {
      const idToFetch = userId || initialUser?._id;
      if (!idToFetch || !isOpen) return;

      setLoading(true);
      try {
        const res = await api.get(`/users/${idToFetch}`);
        setProfileUser(res.data.data);
      } catch (err) {
        console.error('Failed to load user profile', err);
        if (initialUser) setProfileUser(initialUser);
        else toast.error('Could not load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [userId, initialUser, isOpen]);

  if (!isOpen) return null;

  const targetUser = profileUser || initialUser;
  const isSelf = currentUser && targetUser && (currentUser._id === targetUser._id);

  const teachSkills = targetUser?.skillsToTeach || targetUser?.skills?.teach || [];
  const learnSkills = targetUser?.skillsToLearn || targetUser?.skills?.learn || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-gray-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Banner Background */}
          <div className="h-32 bg-gradient-to-r from-purple-900 via-indigo-900 to-rose-900 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white rounded-full transition-colors z-10"
              aria-label="Close profile modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar & Main Details Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-5 -mt-14 mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-800 border-4 border-gray-900 shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                {targetUser?.avatar ? (
                  <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-primary-400">
                    {targetUser?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-white">{targetUser?.name || 'User Profile'}</h2>
                  {targetUser?.role && (
                    <span className="bg-primary-500/20 text-primary-300 text-xs px-2.5 py-0.5 rounded-full border border-primary-500/30 font-medium capitalize">
                      {targetUser.role}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start text-xs text-gray-400 gap-3 mt-1.5">
                  <span className="flex items-center text-yellow-400 font-semibold">
                    <Star size={14} className="mr-1 fill-yellow-400" />
                    {targetUser?.averageRating || targetUser?.rating || '5.0'} ({targetUser?.totalReviews || 0} reviews)
                  </span>
                  <span className="flex items-center text-gray-400">
                    <MapPin size={14} className="mr-1 text-rose-400" />
                    {targetUser?.location || 'Global'}
                  </span>
                  {targetUser?.createdAt && (
                    <span className="flex items-center text-gray-400">
                      <Calendar size={14} className="mr-1 text-blue-400" />
                      Joined {new Date(targetUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                <div className="text-amber-400 flex items-center justify-center mb-1">
                  <Zap size={18} />
                </div>
                <div className="text-lg font-bold text-white">{targetUser?.credits || 0}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Credits</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                <div className="text-purple-400 flex items-center justify-center mb-1">
                  <Award size={18} />
                </div>
                <div className="text-lg font-bold text-white">{targetUser?.xp || 120}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total XP</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                <div className="text-emerald-400 flex items-center justify-center mb-1">
                  <ShieldCheck size={18} />
                </div>
                <div className="text-lg font-bold text-white capitalize">{targetUser?.level || 1}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Level</div>
              </div>
            </div>

            {/* Bio Section */}
            {targetUser?.bio && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">About</h3>
                <p className="text-gray-300 text-sm italic leading-relaxed">
                  "{targetUser.bio}"
                </p>
              </div>
            )}

            {/* Skills Sections */}
            <div className="space-y-4 mb-6">
              {/* Skills to Teach */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                  <GraduationCap size={16} className="text-emerald-400 mr-1.5" />
                  Skills Can Teach
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teachSkills.length > 0 ? (
                    teachSkills.map((skill, idx) => {
                      const name = typeof skill === 'object' ? skill.name : skill;
                      const category = typeof skill === 'object' ? skill.category : null;
                      const proficiency = typeof skill === 'object' ? skill.proficiency : null;

                      return (
                        <span 
                          key={idx} 
                          className="bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-500/30 flex items-center space-x-1.5"
                        >
                          <span>{name}</span>
                          {proficiency && (
                            <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded-full capitalize text-emerald-400">
                              {proficiency}
                            </span>
                          )}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500 italic">No teaching skills listed</span>
                  )}
                </div>
              </div>

              {/* Skills to Learn */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                  <BookOpen size={16} className="text-blue-400 mr-1.5" />
                  Skills Wants to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {learnSkills.length > 0 ? (
                    learnSkills.map((skill, idx) => {
                      const name = typeof skill === 'object' ? skill.name : skill;
                      return (
                        <span 
                          key={idx} 
                          className="bg-blue-950/60 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-medium border border-blue-500/30"
                        >
                          {name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500 italic">No learning skills listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              >
                Close
              </button>

              {!isSelf && targetUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/messages?userId=${targetUser._id}`);
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-[1.02]"
                  >
                    <MessageSquare size={16} className="text-primary-400" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onRequestSwap) onRequestSwap(targetUser);
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Zap size={16} />
                    <span>Request Skill Swap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
