import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SwapModal from '../components/SwapModal';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  GraduationCap, 
  BookOpen, 
  Zap, 
  Award, 
  Calendar, 
  MessageSquare, 
  ShieldCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        setProfileUser(res.data.data);
      } catch (err) {
        console.error('Failed to load profile', err);
        toast.error('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
        <p className="text-gray-400 mb-6">The requested profile could not be found.</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-colors"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isSelf = currentUser && (currentUser._id === profileUser._id);
  const teachSkills = profileUser.skillsToTeach || profileUser.skills?.teach || [];
  const learnSkills = profileUser.skillsToLearn || profileUser.skills?.learn || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Main Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-8"
      >
        {/* Banner Header */}
        <div className="h-40 bg-gradient-to-r from-purple-900 via-indigo-900 to-rose-900 relative" />

        <div className="p-6 sm:p-8 relative">
          {/* Avatar and Primary Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-20 mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-800 border-4 border-gray-900 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary-400">
                  {profileUser.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-3xl font-extrabold text-white">{profileUser.name}</h1>
                {profileUser.role && (
                  <span className="bg-primary-500/20 text-primary-300 text-xs px-3 py-1 rounded-full border border-primary-500/30 font-medium capitalize">
                    {profileUser.role}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start text-sm text-gray-400 gap-4 mt-2">
                <span className="flex items-center text-yellow-400 font-semibold">
                  <Star size={16} className="mr-1 fill-yellow-400" />
                  {profileUser.averageRating || profileUser.rating || '5.0'} ({profileUser.totalReviews || 0} reviews)
                </span>
                <span className="flex items-center">
                  <MapPin size={16} className="mr-1 text-rose-400" />
                  {profileUser.location || 'Global'}
                </span>
                {profileUser.createdAt && (
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1 text-blue-400" />
                    Member since {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {!isSelf && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/messages?userId=${profileUser._id}`)}
                  className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg transition-all hover:scale-105"
                >
                  <MessageSquare size={18} className="text-primary-400" />
                  <span>Chat / Message</span>
                </button>
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-600/30 transition-all hover:scale-105"
                >
                  <Zap size={18} />
                  <span>Request Skill Swap</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <Zap size={22} className="text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{profileUser.credits || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Skill Credits</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <Award size={22} className="text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{profileUser.xp || 120}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Total XP</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <ShieldCheck size={22} className="text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white capitalize">{profileUser.level || 1}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Level</div>
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About {profileUser.name}</h3>
              <p className="text-gray-200 text-base italic leading-relaxed">
                "{profileUser.bio}"
              </p>
            </div>
          )}

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills I Can Teach */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center">
                <GraduationCap size={18} className="text-emerald-400 mr-2" />
                Skills Can Teach
              </h3>
              <div className="flex flex-wrap gap-2">
                {teachSkills.length > 0 ? (
                  teachSkills.map((skill, idx) => {
                    const name = typeof skill === 'object' ? skill.name : skill;
                    const proficiency = typeof skill === 'object' ? skill.proficiency : null;

                    return (
                      <span 
                        key={idx} 
                        className="bg-emerald-950/60 text-emerald-300 px-3.5 py-2 rounded-xl text-sm font-medium border border-emerald-500/30 flex items-center space-x-2"
                      >
                        <span>{name}</span>
                        {proficiency && (
                          <span className="text-xs bg-emerald-900/60 px-2 py-0.5 rounded-full capitalize text-emerald-400">
                            {proficiency}
                          </span>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500 italic">No teaching skills listed yet.</span>
                )}
              </div>
            </div>

            {/* Skills I Want to Learn */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center">
                <BookOpen size={18} className="text-blue-400 mr-2" />
                Skills Wants to Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {learnSkills.length > 0 ? (
                  learnSkills.map((skill, idx) => {
                    const name = typeof skill === 'object' ? skill.name : skill;
                    return (
                      <span 
                        key={idx} 
                        className="bg-blue-950/60 text-blue-300 px-3.5 py-2 rounded-xl text-sm font-medium border border-blue-500/30"
                      >
                        {name}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500 italic">No learning skills listed yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Swap Modal */}
      {isSwapModalOpen && (
        <SwapModal
          partner={profileUser}
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
        />
      )}
    </div>
  );
}
