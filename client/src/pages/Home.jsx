import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-transparent -z-10" />
        
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-rose-600/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-medium mb-8"
          >
            <Sparkles size={18} />
            <span>The New Way to Learn</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
          >
            Exchange Skills, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-rose-400">
              Not Money
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Connect with peers worldwide. Teach what you know, learn what you don't. 
            Join the ultimate peer-to-peer knowledge sharing platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-primary-200 transition-all"
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 opacity-30 group-hover:opacity-60 blur animate-pulse transition-opacity duration-500"></div>
                <span className="relative z-10">Get Started for Free</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/explore">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 shadow-sm hover:shadow-md transition-all"
              >
                <span>Explore Skills</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Users, title: "Peer-to-Peer", desc: "Connect directly with passionate learners and experts." },
              { icon: Zap, title: "Smart Matching", desc: "Our algorithm finds the perfect skill exchange partner." },
              { icon: Sparkles, title: "Skill Credits", desc: "Earn credits by teaching to spend on learning." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary-900/50 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/20 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 bg-primary-900/50 border border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
