import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Zap, 
  GraduationCap, 
  Lock, 
  ChevronDown, 
  MessageSquare,
  Menu,
  X,
  Compass,
  Trophy,
  Map,
  Award,
  BarChart3
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[rgba(108,92,231,0.2)] shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-[#6c5ce7] to-[#00cec9] p-2 rounded-xl text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <Zap size={22} />
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#a29bfe] to-[#00cec9] font-['Outfit'] tracking-tight">
                SkillsVersa
              </span>
            </Link>

            {/* Desktop Navigation Links (Visible on screens > 768px) */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/explore" className="text-gray-300 hover:text-primary-400 text-sm font-medium transition-colors">
                    Explore
                  </Link>
                  <Link to="/messages" className="text-gray-300 hover:text-primary-400 text-sm font-medium transition-colors flex items-center space-x-1">
                    <MessageSquare size={16} className="text-primary-400" />
                    <span>Messages</span>
                  </Link>
                  <Link to="/dashboard" className="text-gray-300 hover:text-primary-400 text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/leaderboard" className="text-gray-300 hover:text-amber-400 text-sm font-medium transition-colors flex items-center space-x-1">
                    <span>🏆 Leaderboard</span>
                  </Link>
                  <Link to="/skill-map" className="text-gray-300 hover:text-cyan-400 text-sm font-medium transition-colors flex items-center space-x-1">
                    <span>🗺️ Skill Map</span>
                  </Link>
                  <Link to="/quizzes" className="text-gray-300 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center space-x-1">
                    <span>🎖️ Quizzes</span>
                  </Link>
                  <Link to="/analytics" className="text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors flex items-center space-x-1">
                    <span>📊 Analytics</span>
                  </Link>
                  <div 
                    className="relative" 
                    ref={dropdownRef}
                  >
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-primary-700" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">{user.name}</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full pt-1.5 w-56 z-50">
                        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-2 space-y-1">
                          <Link 
                            to="/profile?tab=general" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <User size={16} className="text-primary-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link 
                            to="/profile?tab=skills" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <GraduationCap size={16} className="text-emerald-400" />
                            <span>Skills Portfolio</span>
                          </Link>
                          <Link 
                            to="/profile?tab=stats" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Zap size={16} className="text-amber-400" />
                            <span>Credits & Stats</span>
                          </Link>
                          <Link 
                            to="/profile?tab=security" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Lock size={16} className="text-blue-400" />
                            <span>Change Password</span>
                          </Link>
                          <div className="border-t border-gray-700/60 my-1" />
                          <button 
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-primary-400 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2 rounded-full font-medium shadow-md shadow-primary-200 hover:shadow-lg hover:shadow-primary-300 transition-all"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button (Visible on screens <= 768px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer (Right-side slide out rendered via Portal directly on document.body) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Darkened Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] md:hidden"
              />

              {/* Sliding Drawer Overlay right on top of Home page */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 h-full w-[85vw] max-w-[340px] bg-[#0c0c14] border-l border-[rgba(108,92,231,0.3)] shadow-2xl z-[100000] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto md:hidden"
              >
                <div>
                  {/* Header with logo & close icon */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800/80">
                    <Link 
                      to="/" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 group"
                    >
                      <div className="bg-gradient-to-tr from-[#6c5ce7] to-[#00cec9] p-2 rounded-xl text-white shadow-md shadow-purple-900/40">
                        <Zap size={18} />
                      </div>
                      <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#a29bfe] to-[#00cec9] font-['Outfit']">
                        SkillsVersa
                      </span>
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* User Card (If logged in) */}
                  {user && (
                    <div className="bg-gradient-to-r from-primary-900/30 to-purple-900/20 border border-primary-500/20 rounded-2xl p-3.5 mb-5 flex items-center space-x-3 shadow-inner">
                      <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-primary-400/30">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={22} className="text-white" />
                        )}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active Learner
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                      Navigation
                    </div>
                    {user ? (
                      <>
                        <Link
                          to="/explore"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400">
                            <Compass size={18} />
                          </div>
                          <span className="text-sm font-medium">Explore Skills</span>
                        </Link>

                        <Link
                          to="/messages"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                            <MessageSquare size={18} />
                          </div>
                          <span className="text-sm font-medium">Messages</span>
                        </Link>

                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Zap size={18} />
                          </div>
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        <Link
                          to="/leaderboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-amber-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                            <Trophy size={18} />
                          </div>
                          <span className="text-sm font-medium">Leaderboard</span>
                        </Link>

                        <Link
                          to="/skill-map"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-cyan-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <Map size={18} />
                          </div>
                          <span className="text-sm font-medium">Skill Map</span>
                        </Link>

                        <Link
                          to="/quizzes"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-emerald-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Award size={18} />
                          </div>
                          <span className="text-sm font-medium">Quizzes & Tests</span>
                        </Link>

                        <Link
                          to="/analytics"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 hover:text-purple-400 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <BarChart3 size={18} />
                          </div>
                          <span className="text-sm font-medium">Analytics</span>
                        </Link>

                        {/* Account Options */}
                        <div className="pt-4 mt-3 border-t border-gray-800/80">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                            Account Settings
                          </div>
                          <Link
                            to="/profile?tab=general"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
                          >
                            <User size={16} className="text-primary-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/profile?tab=skills"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
                          >
                            <GraduationCap size={16} className="text-emerald-400" />
                            <span>Skills Portfolio</span>
                          </Link>
                          <Link
                            to="/profile?tab=stats"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
                          >
                            <Zap size={16} className="text-amber-400" />
                            <span>Credits & Stats</span>
                          </Link>
                          <Link
                            to="/profile?tab=security"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
                          >
                            <Lock size={16} className="text-blue-400" />
                            <span>Change Password</span>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400">
                            <Zap size={18} />
                          </div>
                          <span className="text-sm font-medium">Home</span>
                        </Link>
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-white/10 transition-all"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <User size={18} />
                          </div>
                          <span className="text-sm font-medium">Login</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-gray-800/80 mt-6">
                  {user ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-medium transition-all"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white font-medium shadow-lg shadow-purple-900/40 hover:brightness-110 transition-all flex items-center justify-center space-x-2">
                        <span>Get Started</span>
                        <Zap size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}


