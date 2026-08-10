import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Award, CheckCircle, HelpCircle, XCircle, ArrowRight, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export default function SkillQuizzes() {
  const { user, setTokenAndFetchUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        setQuizzes(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load skill verification quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setResultModal(null);
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;

    if (Object.keys(selectedAnswers).length < activeQuiz.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/quizzes/submit', {
        quizId: activeQuiz.id,
        answers: selectedAnswers
      });

      setResultModal(res.data);
      
      // Refresh user auth context to reflect new badges & XP
      const token = localStorage.getItem('token');
      if (token) {
        await setTokenAndFetchUser(token);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userBadges = user?.badges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
        >
          <Award size={16} />
          <span>Skill Verification & Verified Badges</span>
        </motion.div>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Skill Verification Quizzes 🏆
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
          Pass quick 5-question MCQ assessments to earn official verified badges on your profile & boost your mentor trust score!
        </p>
      </div>

      {/* Verified Badges Section */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-12">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
          <ShieldCheck className="text-emerald-400" size={20} />
          <span>My Verified Profile Badges ({userBadges.length})</span>
        </h2>

        {userBadges.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No verified badges earned yet. Take a quiz below to earn your first verified badge!</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {userBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-gradient-to-r from-emerald-950/80 to-gray-900/90 border border-emerald-500/40 px-4 py-2.5 rounded-2xl shadow-lg">
                <span className="text-2xl">{badge.icon || '⭐'}</span>
                <div>
                  <h4 className="font-bold text-white text-sm">{badge.name}</h4>
                  <p className="text-xs text-emerald-400">Score: {badge.score}% Verified</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes List Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const hasBadge = userBadges.some(b => b.name === `${quiz.skill} Verified ⭐`);
            return (
              <motion.div
                key={quiz.id}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{quiz.icon}</span>
                    {hasBadge ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                        <CheckCircle size={14} />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="bg-white/5 text-gray-400 border border-white/10 text-xs px-3 py-1 rounded-full font-medium">
                        5 Questions
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                  <p className="text-xs text-gray-400 mb-6">Skill: <span className="text-primary-300 font-semibold">{quiz.skill}</span> ({quiz.category})</p>
                </div>

                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                    hasBadge 
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 hover:scale-[1.02]'
                  }`}
                >
                  <span>{hasBadge ? 'Retake Assessment' : 'Start Verification Quiz'}</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
              {!resultModal ? (
                <form onSubmit={handleSubmitQuiz} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{activeQuiz.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{activeQuiz.title}</h3>
                        <p className="text-xs text-gray-400">Score 70% or higher to earn badge</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActiveQuiz(null)} className="text-gray-400 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                        <h4 className="font-semibold text-white text-sm flex items-start space-x-2">
                          <span className="text-primary-400 font-bold">{idx + 1}.</span>
                          <span>{q.question}</span>
                        </h4>
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, optIdx)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                                  isSelected 
                                    ? 'bg-primary-600/30 border-primary-400 text-white font-bold ring-1 ring-primary-500' 
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => setActiveQuiz(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/10 text-sm">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50">
                      {isSubmitting ? 'Evaluating...' : 'Submit Answers'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Result Modal View */
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-2xl">
                    {resultModal.passed ? '🏆' : '📚'}
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-white">
                      {resultModal.passed ? 'Congratulations! Quiz Passed 🎉' : 'Keep Learning & Try Again!'}
                    </h3>
                    <p className="text-sm text-gray-300 mt-2">
                      You scored <span className="font-extrabold text-amber-400">{resultModal.score}%</span> ({resultModal.correctCount}/{resultModal.totalQuestions} correct)
                    </p>
                  </div>

                  {resultModal.passed && (
                    <div className="bg-gradient-to-r from-emerald-950/80 to-gray-900/90 p-4 rounded-2xl border border-emerald-500/40 inline-flex items-center space-x-3 text-left">
                      <span className="text-3xl">{resultModal.badge?.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{resultModal.badge?.name}</h4>
                        <p className="text-xs text-emerald-400">+100 XP Bonus Awarded!</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-3 pt-4">
                    <button onClick={() => { setActiveQuiz(null); setResultModal(null); }} className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg">
                      Back to Quizzes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
