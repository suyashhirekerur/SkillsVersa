import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Check, X, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/sessions');
        setSessions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSessionAction = async (id, action) => {
    try {
      await api.put(`/sessions/${id}/${action}`);
      toast.success(`Session ${action}ed`);
      setSessions(sessions.map(s => s._id === id ? { ...s, status: action === 'accept' ? 'accepted' : 'rejected' } : s));
    } catch (err) {
      toast.error(`Failed to ${action} session`);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 flex items-center space-x-2 shadow-sm">
          <span className="text-primary-300 font-semibold">Credits:</span>
          <span className="text-xl font-bold text-white">{user?.credits || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Skills */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-white">
            <GraduationCap className="text-primary-400" />
            <span>My Skills</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">I can teach</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.teach?.map((skill, i) => (
                  <span key={i} className="bg-primary-900/40 text-primary-300 px-3 py-1 rounded-full text-sm font-medium border border-primary-500/30">
                    {skill.name || skill}
                  </span>
                ))}
                {(!user?.skills?.teach || user.skills.teach.length === 0) && (
                  <p className="text-sm text-gray-400">No teaching skills added yet.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">I want to learn</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.learn?.map((skill, i) => (
                  <span key={i} className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                    {skill.name || skill}
                  </span>
                ))}
                {(!user?.skills?.learn || user.skills.learn.length === 0) && (
                  <p className="text-sm text-gray-400">No learning skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-white">
            <Clock className="text-primary-400" />
            <span>Recent Sessions</span>
          </h2>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
            </div>
          ) : sessions.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {sessions.map(session => (
                <motion.div 
                  variants={itemVariants}
                  key={session._id} 
                  className="p-4 rounded-xl border border-white/10 flex items-center justify-between hover:border-white/30 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-white">{session.skill}</h4>
                    <p className="text-sm text-gray-400 capitalize">Status: {session.status}</p>
                  </div>
                  
                  {session.status === 'pending' && session.receiver === user._id && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSessionAction(session._id, 'accept')}
                        className="p-2 bg-success-50 text-success-600 hover:bg-success-100 rounded-full transition-colors"
                        title="Accept"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleSessionAction(session._id, 'reject')}
                        className="p-2 bg-danger-50 text-danger-600 hover:bg-danger-100 rounded-full transition-colors"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center">
              <BookOpen size={48} className="text-gray-600 mb-3" />
              <p>No active sessions found.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
