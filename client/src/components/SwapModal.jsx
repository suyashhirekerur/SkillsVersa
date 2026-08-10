import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, BookOpen, GraduationCap, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SwapModal({ partner, isOpen, onClose }) {
  const { user: currentUser } = useAuth();
  
  const partnerTeachSkills = partner?.skillsToTeach || partner?.skills?.teach || [];
  const myTeachSkills = currentUser?.skillsToTeach || currentUser?.skills?.teach || [];

  const [skillRequested, setSkillRequested] = useState(
    partnerTeachSkills.length > 0 
      ? (typeof partnerTeachSkills[0] === 'object' ? partnerTeachSkills[0].name : partnerTeachSkills[0])
      : ''
  );
  const [skillOffered, setSkillOffered] = useState(
    myTeachSkills.length > 0 
      ? (typeof myTeachSkills[0] === 'object' ? myTeachSkills[0].name : myTeachSkills[0])
      : ''
  );

  // Tomorrow by default
  const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !partner) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skillRequested || !skillOffered) {
      toast.error('Please select both a requested skill and an offered skill');
      return;
    }

    if (new Date(scheduledDate) <= new Date()) {
      toast.error('Please select a future date and time for the session');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/sessions', {
        partnerId: partner._id,
        skillOffered,
        skillRequested,
        scheduledDate,
        duration: Number(duration),
        notes
      });

      toast.success(`Skill swap request sent to ${partner.name}! 🎉`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send swap request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-gray-900 border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden my-8"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Request Skill Swap</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Propose a 1-on-1 learning session with {partner.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skill Requested */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                <BookOpen size={14} className="text-primary-400 mr-1.5" />
                Skill You Want to Learn from {partner.name}
              </label>
              {partnerTeachSkills.length > 0 ? (
                <select
                  value={skillRequested}
                  onChange={(e) => setSkillRequested(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  {partnerTeachSkills.map((s, idx) => {
                    const name = typeof s === 'object' ? s.name : s;
                    return <option key={idx} value={name}>{name}</option>;
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={skillRequested}
                  onChange={(e) => setSkillRequested(e.target.value)}
                  placeholder="e.g. React, UI Design"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              )}
            </div>

            {/* Skill Offered */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                <GraduationCap size={14} className="text-emerald-400 mr-1.5" />
                Skill You Will Teach {partner.name}
              </label>
              {myTeachSkills.length > 0 ? (
                <select
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {myTeachSkills.map((s, idx) => {
                    const name = typeof s === 'object' ? s.name : s;
                    return <option key={idx} value={name}>{name}</option>;
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  placeholder="e.g. Python, Public Speaking"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                  <Calendar size={14} className="text-blue-400 mr-1.5" />
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                  <Clock size={14} className="text-amber-400 mr-1.5" />
                  Duration (Minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 hour)</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes (2 hours)</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Message / Agenda (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you hope to focus on during this session..."
                className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Swap Request'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
