import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Trophy, Award, Flame, Star, Zap, User, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/users/leaderboard');
        setLeaderboard(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // User stats calculation
  const currentXP = user?.xp || 120;
  const currentLevel = user?.level || Math.floor(currentXP / 200) + 1;
  const xpForNextLevel = currentLevel * 200;
  const xpProgress = Math.min(100, Math.round((currentXP % 200) / 200 * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Top Banner */}
      <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
        >
          <Trophy size={16} />
          <span>Global Skill Exchangers Leaderboard</span>
        </motion.div>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Top Mentors & Skill Champions 🏆
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm">
          Earn XP by teaching sessions, passing verification quizzes, and maintaining daily learning streaks!
        </p>
      </div>

      {/* User Gamification Card */}
      <div className="bg-gradient-to-r from-purple-900/60 via-gray-900/90 to-indigo-900/60 rounded-3xl p-6 border border-white/10 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-gray-900 font-extrabold text-2xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Level {currentLevel}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-3">
              <span className="flex items-center space-x-1 text-amber-400 font-semibold"><Zap size={14} /> <span>{currentXP} Total XP</span></span>
              <span className="flex items-center space-x-1 text-rose-400 font-semibold"><Flame size={14} /> <span>{user?.streak || 3} Day Streak 🔥</span></span>
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full md:w-80 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1.5">
            <span>Level {currentLevel} Progress</span>
            <span className="text-amber-400">{currentXP % 200} / 200 XP</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end max-w-4xl mx-auto">
            {/* Rank 2 - Silver */}
            {topThree[1] && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="order-2 md:order-1 bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-slate-400/30 rounded-3xl p-6 text-center shadow-xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black text-xs px-3 py-1 rounded-full border border-white uppercase shadow-md flex items-center space-x-1">
                  <span>🥈 2nd Place</span>
                </div>
                <div className="w-20 h-20 rounded-full mx-auto mb-3 mt-2 border-4 border-slate-300 overflow-hidden shadow-lg flex items-center justify-center bg-gray-700">
                  {topThree[1].avatar ? <img src={topThree[1].avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{topThree[1].name[0]}</span>}
                </div>
                <h3 className="text-lg font-bold text-white">{topThree[1].name}</h3>
                <p className="text-xs text-amber-400 font-semibold mt-1">{topThree[1].xp || 450} XP</p>
                <div className="flex justify-center items-center space-x-1 text-xs text-yellow-400 mt-2">
                  <Star size={14} className="fill-yellow-400" />
                  <span>{topThree[1].averageRating || '5.0'}</span>
                </div>
              </motion.div>
            )}

            {/* Rank 1 - Gold */}
            {topThree[0] && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-gray-900/90 to-gray-900/90 border-2 border-amber-400/60 rounded-3xl p-8 text-center shadow-2xl relative transform md:-translate-y-4">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-900 font-black text-sm px-4 py-1 rounded-full border border-amber-200 uppercase shadow-xl flex items-center space-x-1">
                  <span>👑 1st Champion</span>
                </div>
                <div className="w-24 h-24 rounded-full mx-auto mb-4 mt-2 border-4 border-amber-400 overflow-hidden shadow-2xl flex items-center justify-center bg-gray-800">
                  {topThree[0].avatar ? <img src={topThree[0].avatar} className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-amber-400">{topThree[0].name[0]}</span>}
                </div>
                <h3 className="text-xl font-extrabold text-white">{topThree[0].name}</h3>
                <p className="text-sm text-amber-400 font-black mt-1">{topThree[0].xp || 780} XP</p>
                <div className="flex justify-center items-center space-x-1 text-xs text-yellow-400 mt-2">
                  <Star size={16} className="fill-yellow-400" />
                  <span className="font-bold">{topThree[0].averageRating || '5.0'}</span>
                  <span className="text-gray-400">({topThree[0].totalReviews || 12} reviews)</span>
                </div>
              </motion.div>
            )}

            {/* Rank 3 - Bronze */}
            {topThree[2] && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="order-3 bg-gradient-to-b from-amber-900/30 to-gray-900/90 border border-amber-700/40 rounded-3xl p-6 text-center shadow-xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-xs px-3 py-1 rounded-full border border-amber-500 uppercase shadow-md flex items-center space-x-1">
                  <span>🥉 3rd Place</span>
                </div>
                <div className="w-20 h-20 rounded-full mx-auto mb-3 mt-2 border-4 border-amber-600 overflow-hidden shadow-lg flex items-center justify-center bg-gray-700">
                  {topThree[2].avatar ? <img src={topThree[2].avatar} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold">{topThree[2].name[0]}</span>}
                </div>
                <h3 className="text-lg font-bold text-white">{topThree[2].name}</h3>
                <p className="text-xs text-amber-400 font-semibold mt-1">{topThree[2].xp || 320} XP</p>
                <div className="flex justify-center items-center space-x-1 text-xs text-yellow-400 mt-2">
                  <Star size={14} className="fill-yellow-400" />
                  <span>{topThree[2].averageRating || '4.9'}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <TrendingUp size={20} className="text-primary-400" />
                <span>Global Rankings</span>
              </h3>
              <span className="text-xs text-gray-400 font-medium">Rankings update in real-time</span>
            </div>

            <div className="divide-y divide-white/5">
              {leaderboard.map((item, idx) => (
                <div key={item._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className={`w-8 font-black text-center text-sm ${idx === 0 ? 'text-yellow-400 text-lg' : idx === 1 ? 'text-gray-300 text-base' : idx === 2 ? 'text-amber-600 text-base' : 'text-gray-500'}`}>
                      #{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-primary-900 border border-white/20 overflow-hidden flex items-center justify-center">
                      {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-primary-300">{item.name[0]}</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.badges?.length > 0 && (
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-normal border border-amber-500/30">
                            {item.badges.length} Badges
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">{item.skillsToTeach?.[0]?.name ? `Teaches ${item.skillsToTeach[0].name}` : 'Skill Mentor'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <span className="block text-sm font-extrabold text-amber-400">{item.xp || 150} XP</span>
                      <span className="text-xs text-gray-500">Level {Math.floor((item.xp || 150) / 200) + 1}</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-1 bg-white/5 px-3 py-1 rounded-xl text-xs text-yellow-400 font-bold border border-white/10">
                      <Star size={14} className="fill-yellow-400" />
                      <span>{item.averageRating || '5.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
