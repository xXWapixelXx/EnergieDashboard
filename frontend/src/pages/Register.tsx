import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser } from 'react-icons/fi';
import authService from '../services/auth';
import type { RegisterCredentials } from '../types/auth';
import { Link } from 'react-router-dom';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }
    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn');
      return;
    }
    setIsLoading(true);
    try {
      await authService.register({ username, email, password });
      setSuccess(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Server niet bereikbaar. Probeer het later opnieuw.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Sparkle/particle overlay */}
      <svg className="sparkle left-1/4 top-1/4 w-8 h-8" style={{animationDelay: '0s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" fill="#fff" opacity="0.8"/><circle cx="12" cy="12" r="6" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5"/></svg>
      <svg className="sparkle right-1/3 top-1/2 w-6 h-6" style={{animationDelay: '2s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.7"/><circle cx="12" cy="12" r="4" stroke="#a21caf" strokeWidth="1.2" opacity="0.4"/></svg>
      <svg className="sparkle left-1/2 bottom-1/4 w-5 h-5" style={{animationDelay: '4s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1" fill="#fff" opacity="0.6"/><circle cx="12" cy="12" r="3" stroke="#f472b6" strokeWidth="1" opacity="0.3"/></svg>

      <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center">
        {/* Logo and Title */}
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
            Account aanmaken
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300"
          >
            Maak een account aan om te starten met EnergieDashboard!
          </motion.p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20 w-full"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600"
            >
              <FiAlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Field */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label htmlFor="username" className="block text-lg font-semibold text-gray-200 mb-2">Gebruikersnaam</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Kies een gebruikersnaam"
                  disabled={isLoading}
                />
              </div>
            </motion.div>
            {/* Email Field */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-200 mb-2">E-mailadres</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="naam@voorbeeld.nl"
                  disabled={isLoading}
                />
              </div>
            </motion.div>
            {/* Password Field */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-200 mb-2">Wachtwoord</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-14 pr-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </motion.div>
            {/* Confirm Password Field */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <label htmlFor="confirmPassword" className="block text-lg font-semibold text-gray-200 mb-2">Bevestig wachtwoord</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-6 w-6 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field pl-14 pr-14 py-4 text-lg bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Herhaal je wachtwoord"
                  disabled={isLoading}
                />
              </div>
            </motion.div>
            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full py-4 text-lg relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Account aanmaken...
                  </>
                ) : (
                  <>
                    Account aanmaken
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
              <span className="text-lg text-primary-200 font-bold mt-2">Welkom bij EnergieDashboard! Je account is aangemaakt.</span>
            </motion.div>
          )}
          {/* Login link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-lg text-gray-400">
              Heb je al een account?{' '}
              <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                Log in hier
              </Link>
            </p>
          </motion.div>
        </motion.div>
        {/* Info/Tip Card under the register card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.1, type: 'spring' }}
          className="mt-10 w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl px-8 py-6 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 via-purple-400 to-pink-400 shadow-lg animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <span className="text-xl font-bold text-white drop-shadow">Wist je dat?</span>
          </div>
          <p className="text-center text-white/90 text-base font-medium">
            Je kunt je energieverbruik efficiënter beheren door dagelijks je dashboard te checken.<br/>
            <span className="text-primary-200 font-semibold">Blijf in controle, bespaar meer!</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 