import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Check, X, Clock, BookOpen, GraduationCap, FileText, Code, CheckSquare, Sparkles, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContractSession, setActiveContractSession] = useState(null);
  const [activeNotesSession, setActiveNotesSession] = useState(null);

  // Contract form state
  const [learningGoals, setLearningGoals] = useState('');
  const [deliverables, setDeliverables] = useState('');

  // Notes form state
  const [notesText, setNotesText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

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

  const handleSignContract = async (session) => {
    try {
      const res = await api.put(`/sessions/${session._id}/contract`, {
        learningGoals,
        deliverables
      });
      toast.success('Digital Contract signed successfully! 📝');
      setSessions(sessions.map(s => s._id === session._id ? res.data.data : s));
      setActiveContractSession(null);
    } catch (err) {
      toast.error('Failed to sign contract');
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!activeNotesSession) return;

    setIsSavingNotes(true);
    try {
      const res = await api.put(`/sessions/${activeNotesSession._id}/notes`, {
        notes: notesText,
        codeSnippets: codeSnippet
      });
      toast.success('Session notes & resources saved! 💭');
      setSessions(sessions.map(s => s._id === activeNotesSession._id ? res.data.data : s));
      setActiveNotesSession(null);
    } catch (err) {
      toast.error('Failed to save session notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const openContractModal = (session) => {
    setActiveContractSession(session);
    setLearningGoals(session.contract?.learningGoals || `Master fundamental principles of ${session.skillRequested || 'the topic'}`);
    setDeliverables(session.contract?.deliverables || `1-on-1 guided live coding & code review session (${session.duration || 60} mins)`);
  };

  const openNotesModal = (session) => {
    setActiveNotesSession(session);
    setNotesText(session.resources?.notes || session.notes || '');
    setCodeSnippet(session.resources?.codeSnippets || '');
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
                {(user?.skillsToTeach || user?.skills?.teach || []).map((skill, i) => (
                  <span key={i} className="bg-primary-900/40 text-primary-300 px-3 py-1 rounded-full text-sm font-medium border border-primary-500/30">
                    {typeof skill === 'object' ? skill.name : skill}
                  </span>
                ))}
                {(!user?.skillsToTeach && !user?.skills?.teach || (user?.skillsToTeach || user?.skills?.teach || []).length === 0) && (
                  <p className="text-sm text-gray-400">No teaching skills added yet.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">I want to learn</h3>
              <div className="flex flex-wrap gap-2">
                {(user?.skillsToLearn || user?.skills?.learn || []).map((skill, i) => (
                  <span key={i} className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                    {typeof skill === 'object' ? skill.name : skill}
                  </span>
                ))}
                {(!user?.skillsToLearn && !user?.skills?.learn || (user?.skillsToLearn || user?.skills?.learn || []).length === 0) && (
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
            <span>Recent Sessions & Contracts</span>
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
                  className="p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/30 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {session.skillOffered ? `${session.skillOffered} ➔ ${session.skillRequested}` : session.skill || 'Skill Exchange'}
                    </h4>
                    <p className="text-xs text-gray-400 capitalize flex items-center space-x-2 mt-1">
                      <span>Status: <strong className="text-primary-300">{session.status}</strong></span>
                      {session.contract?.agreedByTeacher && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">Contract Signed 📝</span>}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Contract Button */}
                    <button 
                      onClick={() => openContractModal(session)}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <FileText size={14} />
                      <span>Contract</span>
                    </button>

                    {/* Notes & Knowledge Base Button */}
                    <button 
                      onClick={() => openNotesModal(session)}
                      className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Code size={14} />
                      <span>Notes</span>
                    </button>

                    {session.status === 'pending' && (session.createdBy?._id || session.createdBy) !== user?._id && (
                      <div className="flex space-x-1 ml-1">
                        <button 
                          onClick={() => handleSessionAction(session._id, 'accept')}
                          className="p-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-full transition-colors"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleSessionAction(session._id, 'reject')}
                          className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-full transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Feature 7: Digital Contract Agreement Modal */}
      <AnimatePresence>
        {activeContractSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FileText className="text-amber-400" />
                  <span>Digital Skill Exchange Contract 📝</span>
                </h3>
                <button onClick={() => setActiveContractSession(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-xs text-gray-300">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                  <p><strong className="text-white">Topic:</strong> {activeContractSession.skillOffered} ➔ {activeContractSession.skillRequested}</p>
                  <p><strong className="text-white">Duration:</strong> {activeContractSession.duration || 60} Minutes</p>
                  <p><strong className="text-white">Cost:</strong> {activeContractSession.creditCost || 10} Credits</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Agreed Learning Goals</label>
                  <textarea
                    rows={3}
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Expected Deliverables & Code Review</label>
                  <textarea
                    rows={2}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckSquare size={16} />
                  <span>Digital Verification Stamp</span>
                </span>
                <button
                  onClick={() => handleSignContract(activeContractSession)}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg"
                >
                  Sign & Lock Contract
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature 10: Session Notes & Knowledge Base Modal */}
      <AnimatePresence>
        {activeNotesSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Code className="text-cyan-400" />
                  <span>Session Notes & Knowledge Base 💭</span>
                </h3>
                <button onClick={() => setActiveNotesSession(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveNotes} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Session Key Takeaways & Study Notes</label>
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Attach key insights, takeaways, and documentation links..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Code Snippets & Code Examples</label>
                  <textarea
                    rows={4}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste code examples or code snippets here..."
                    className="w-full px-3 py-2 bg-gray-950 border border-white/10 rounded-xl text-emerald-400 font-mono outline-none focus:ring-1 focus:ring-cyan-400 text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setActiveNotesSession(null)} className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 text-xs">Cancel</button>
                  <button type="submit" disabled={isSavingNotes} className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg disabled:opacity-50 flex items-center space-x-1">
                    <Send size={14} />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Knowledge Base'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

