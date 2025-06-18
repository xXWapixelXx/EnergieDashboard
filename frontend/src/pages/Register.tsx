import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Sparkle/particle overlay */}
      <svg className="sparkle left-1/4 top-1/4 w-8 h-8" style={{animationDelay: '0s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" fill="#fff" opacity="0.8"/><circle cx="12" cy="12" r="6" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5"/></svg>
      <svg className="sparkle right-1/3 top-1/2 w-6 h-6" style={{animationDelay: '2s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.7"/><circle cx="12" cy="12" r="4" stroke="#a21caf" strokeWidth="1.2" opacity="0.4"/></svg>
      <svg className="sparkle left-1/2 bottom-1/4 w-5 h-5" style={{animationDelay: '4s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1" fill="#fff" opacity="0.6"/><circle cx="12" cy="12" r="3" stroke="#f472b6" strokeWidth="1" opacity="0.3"/></svg>

      {/* Registration Card with animated border */}
      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center card-animated-border">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-28 h-28 mx-auto mb-8 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl"
          >
            <span className="text-6xl" role="img" aria-label="party">🎉</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-white mb-3"
          >
            Create your account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300"
          >
            Join EnergieDashboard and start your smart energy journey!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20 w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label htmlFor="username" className="block text-lg font-semibold text-gray-200 mb-2">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Choose a username"
                />
              </div>
            </motion.div>
            {/* Email */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-200 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>
            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-200 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Create a password"
                />
              </div>
            </motion.div>
            {/* Confirm Password */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <label htmlFor="confirmPassword" className="block text-lg font-semibold text-gray-200 mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Repeat your password"
                />
              </div>
            </motion.div>
            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 24px #38bdf8, 0 0 48px #a21caf33' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full py-4 text-lg relative overflow-hidden group shadow-xl ring-2 ring-primary-400/30 hover:ring-primary-400/60 focus:ring-4 focus:ring-primary-400/80"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
                    <CheckCircleIcon className="w-6 h-6 ml-3 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>
          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 flex flex-col items-center"
            >
              <span className="text-4xl animate-bounce">🎊</span>
              <span className="text-lg text-primary-200 font-bold mt-2">Welcome to EnergieDashboard!</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 