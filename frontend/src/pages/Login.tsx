import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import authService from '../services/auth';
import type { LoginCredentials } from '../types/auth';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Autoscale logic
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function handleResize() {
      if (contentRef.current) {
        const vh = window.innerHeight;
        const contentHeight = contentRef.current.offsetHeight;
        const max = vh * 0.92;
        setScale(contentHeight > max ? max / contentHeight : 1);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.debug('Login: Submitting', { email, password });
    try {
      await authService.login({ email, password });
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
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
      } else if (!navigator.onLine) {
        setError('Geen internetverbinding');
      } else {
        setError('Server niet bereikbaar. Probeer het later opnieuw.');
      }
    } finally {
      setIsLoading(false);
      console.debug('Login: Done', { error });
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center relative overflow-hidden max-h-screen overflow-auto">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          minHeight: 0,
          width: '100%',
          marginTop: '4vh',
        }}
      >
        <div ref={contentRef}>
          {/* Animated Sparkle/particle overlay */}
          <svg className="sparkle left-1/4 top-1/4 w-8 h-8" style={{animationDelay: '0s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" fill="#fff" opacity="0.8"/><circle cx="12" cy="12" r="6" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5"/></svg>
          <svg className="sparkle right-1/3 top-1/2 w-6 h-6" style={{animationDelay: '2s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.5" fill="#fff" opacity="0.7"/><circle cx="12" cy="12" r="4" stroke="#a21caf" strokeWidth="1.2" opacity="0.4"/></svg>
          <svg className="sparkle left-1/2 bottom-1/4 w-5 h-5" style={{animationDelay: '4s'}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1" fill="#fff" opacity="0.6"/><circle cx="12" cy="12" r="3" stroke="#f472b6" strokeWidth="1" opacity="0.3"/></svg>

          {/* Animated Card */}
          <div className="w-full max-w-lg mx-auto relative z-10 flex flex-col items-center flex-shrink-0">
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4 sm:mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-28 h-28 mx-auto mb-8 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl"
              >
                <span className="text-6xl" role="img" aria-label="lightning">⚡</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-white mb-3"
              >
                EnergieDashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-300"
              >
                Log in op je account om verder te gaan
              </motion.p>
            </motion.div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-3 sm:p-6 md:p-8 lg:p-10 border border-white/20 w-full max-h-[90vh] overflow-auto"
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
                {/* Email Field */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
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
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
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
                {/* Remember Me & Forgot Password */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input type="checkbox" className="h-5 w-5 text-primary-500 focus:ring-primary-500 border-gray-600 rounded bg-white/5" disabled={isLoading} />
                    <label className="ml-3 block text-base text-gray-300">Onthoud mij</label>
                  </div>
                  <a href="#" className="text-base font-medium text-primary-400 hover:text-primary-300 transition-colors">Wachtwoord vergeten?</a>
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
                        Inloggen...
                      </>
                    ) : (
                      <>
                        Inloggen
                      </>
                    )}
                  </div>
                </motion.button>
              </form>
              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-lg text-gray-400">
                  Nog geen account?{' '}
                  <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                    Registreer hier
                  </Link>
                </p>
              </motion.div>
            </motion.div>
            {/* Info/Tip Card under the login card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 1.1, type: 'spring' }}
              className="mt-4 sm:mt-8 w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl px-4 py-4 flex flex-col items-center gap-2 max-h-[30vh] overflow-auto"
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
      </div>
    </div>
  );
};

export default Login; 