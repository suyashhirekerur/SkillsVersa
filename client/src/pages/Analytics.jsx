import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Zap, Star, ShieldCheck, PieChart, Activity } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('monthly');

  // Computed metrics
  const credits = user?.credits || 50;
  const xp = user?.xp || 120;
  const rating = user?.averageRating || '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
          >
            <BarChart3 size={16} />
            <span>Personal Skill Analytics</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Skill Analytics Dashboard 📊
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Track your learning journey, credit flows, teaching hours, and progression velocity.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          {['weekly', 'monthly', 'all-time'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                timeframe === tf ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hours Invested</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><Clock size={20} /></div>
          </div>
          <div className="text-3xl font-black text-white">18.5 hrs</div>
          <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center space-x-1">
            <TrendingUp size={12} /> <span>+2.4 hrs this week</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Credits</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><Zap size={20} /></div>
          </div>
          <div className="text-3xl font-black text-amber-400">{credits}</div>
          <p className="text-xs text-gray-400 font-medium mt-2">Spent 30 | Earned 80</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Peer Rating</span>
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl"><Star size={20} /></div>
          </div>
          <div className="text-3xl font-black text-white">{rating}</div>
          <p className="text-xs text-amber-400 font-medium mt-2 flex items-center space-x-1">
            <span>⭐⭐⭐⭐⭐ 100% Positive</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Learning Velocity</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl"><Activity size={20} /></div>
          </div>
          <div className="text-3xl font-black text-white">94%</div>
          <p className="text-xs text-purple-300 font-medium mt-2">Top 5% Learner Speed</p>
        </div>
      </div>

      {/* Visual Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Sessions Completed Over Time Chart (SVG Bar Chart) */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Sessions Completed over Time</h3>
              <p className="text-xs text-gray-400">Teaching vs Learning breakdown</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center space-x-1 text-primary-400"><span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" /> <span>Teaching</span></span>
              <span className="flex items-center space-x-1 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> <span>Learning</span></span>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-white/10 pb-4">
            {[
              { label: 'Mon', teach: 60, learn: 40 },
              { label: 'Tue', teach: 80, learn: 30 },
              { label: 'Wed', teach: 40, learn: 90 },
              { label: 'Thu', teach: 100, learn: 60 },
              { label: 'Fri', teach: 50, learn: 70 },
              { label: 'Sat', teach: 90, learn: 100 },
              { label: 'Sun', teach: 75, learn: 50 },
            ].map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div className="w-1/2 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all group-hover:brightness-125" style={{ height: `${day.teach}%` }} />
                  <div className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all group-hover:brightness-125" style={{ height: `${day.learn}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Credits Flow Chart */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Skill Credits Flow Chart</h3>
              <p className="text-xs text-gray-400">Credit earnings & expenditure balance</p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold border border-amber-500/30">
              +{credits} Net Credits
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-emerald-400">Teaching Credits Earned (+80)</span>
                <span className="text-gray-400">72% of Total Flow</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full w-[72%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-rose-400">Learning Sessions Booked (-30)</span>
                <span className="text-gray-400">28% of Total Flow</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full w-[28%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-amber-400">Signup Bonus & Quiz Rewards (+50)</span>
                <span className="text-gray-400">Active Bonus</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full w-[50%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
