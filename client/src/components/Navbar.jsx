import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-md border-b border-white/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-xl text-white">
              <Zap size={24} />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              SkillsVersa
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/explore" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Explore
                </Link>
                <Link to="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-primary-700" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="p-2">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
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
        </div>
      </div>
    </motion.nav>
  );
}
