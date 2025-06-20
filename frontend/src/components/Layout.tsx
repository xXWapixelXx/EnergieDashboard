import React, { useState } from 'react';
import { FiHome, FiBarChart2, FiSettings, FiAlertTriangle, FiUser, FiLogOut, FiChevronDown, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';
import type { User } from '../types/auth';

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FiBarChart2 />, label: 'Historiek', path: '/historiek' },
  { icon: <FiSettings />, label: 'Instellingen', path: '/instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', path: '/alerts', hasAlert: true },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="fixed top-8 left-8 z-30 flex flex-col gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl px-2 py-10 w-24 items-center min-h-[600px]"
      style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-xl mb-8"
      >
        <span className="text-3xl" role="img" aria-label="lightning">⚡</span>
      </motion.div>
      <nav className="flex flex-col gap-4 w-full items-center">
        {navItems.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.15 }}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150
              ${location.pathname === item.path ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
            title={item.label}
          >
            {item.icon}
            {item.hasAlert && (
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white/40"></span>
            )}
          </motion.button>
        ))}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            onClick={() => navigate('/admin')}
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150
              ${location.pathname === '/admin' ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
            title="Admin"
          >
            <FiUser />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.15 }}
          className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150 text-primary-200 hover:bg-red-600/80 hover:text-white mt-2"
          onClick={handleLogout}
          title="Uitloggen"
        >
          <FiLogOut />
        </motion.button>
      </nav>
    </motion.aside>
  );
};

const ProfileButton: React.FC<{ user: User | null }> = ({ user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed top-8 right-8 z-40">
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setShowProfileMenu(v => !v)}
        className="flex items-center gap-3 bg-sky-600 px-3 py-2 rounded-full border-2 border-sky-400 shadow-lg hover:bg-sky-700 transition-all text-white"
      >
        <span className="w-9 h-9 rounded-full bg-sky-800 flex items-center justify-center">
          <FiUser className="text-xl text-sky-200" />
        </span>
        <span className="font-bold pr-1 hidden md:inline">
          {user?.sub || user?.email || 'Gebruiker'}
        </span>
        {user?.role && (
          <span className="bg-sky-800/80 text-white text-xs px-2 py-1 rounded-md font-semibold hidden md:inline">
            {user.role}
          </span>
        )}
        <FiChevronDown className="hidden md:inline" />
      </motion.button>
      {showProfileMenu && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="absolute right-0 mt-3 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 flex flex-col gap-2"
        >
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-sky-300"><FiUser /> Mijn Profiel</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-sky-300"><FiSettings /> Account Instellingen</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-sky-300"><FiShield /> Privacy & Beveiliging</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-sky-300"><FiBarChart2 /> Help & Ondersteuning</button>
          <div className="h-px bg-slate-700 my-1"></div>
          <button 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-red-500 font-semibold" 
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
          >
            <FiLogOut /> Uitloggen
          </button>
        </motion.div>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authService.getUser();
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900 flex items-stretch">
      <Sidebar />
      <main className="flex-1 flex flex-col py-12 ml-32">
        <ProfileButton user={user} />
        {children}
      </main>
    </div>
  );
};

export default Layout; 