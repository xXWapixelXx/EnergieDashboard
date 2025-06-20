import React, { useState, useEffect } from 'react';
import { FiHome, FiBarChart2, FiSettings, FiAlertTriangle, FiUser, FiLogOut, FiChevronDown, FiShield, FiBell, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';
import type { User } from '../types/auth';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  is_read: boolean;
  created_at: string;
}

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FiBarChart2 />, label: 'Historiek', path: '/historiek' },
  { icon: <FiSettings />, label: 'Instellingen', path: '/instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', path: '/alerts' },
];

const Sidebar: React.FC<{ unreadCount: number }> = ({ unreadCount }) => {
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
            {item.label === 'Alerts' && unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white"
              >
                {unreadCount}
              </motion.span>
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

const NotificationBell: React.FC<{ 
  notifications: Notification[], 
  onMarkAsRead: (id: number) => void 
}> = ({ notifications, onMarkAsRead }) => {
  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed top-8 right-80 z-40">
       <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring' }}
        onClick={() => setShowPanel(v => !v)}
        className="relative flex items-center justify-center w-14 h-14 bg-sky-600/50 rounded-full border-2 border-sky-400/50 shadow-lg hover:bg-sky-700/80 transition-all text-white"
      >
        <FiBell className="text-4xl" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
      <AnimatePresence>
        {showPanel && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-96 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-bold text-lg text-sky-200">Notificaties</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id}
                    className={`flex items-start gap-3 p-4 border-b border-slate-800 transition-colors ${!n.is_read ? 'bg-sky-900/20' : ''}`}
                  >
                    <div className={`mt-1 p-2 rounded-full ${ n.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-sky-500/20 text-sky-400'}`}>
                      <FiAlertTriangle />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sky-300">{n.title}</p>
                      <p className="text-sm text-slate-400">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && (
                       <button onClick={() => onMarkAsRead(n.id)} className="p-2 rounded-full hover:bg-slate-700" title="Markeer als gelezen">
                         <FiCheck className="text-green-400" />
                       </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <FiBell className="mx-auto text-4xl mb-2" />
                  Je hebt geen nieuwe notificaties.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();

    // Setup WebSocket
    const ws = new WebSocket(`${WS_URL}/ws`);
    ws.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data.replace(/'/g, '"'));
        setNotifications(prev => [newNotification, ...prev]);
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 flex items-center gap-4`}
          >
            <FiAlertTriangle className="text-yellow-400 text-2xl" />
            <div>
              <h4 className="font-bold text-yellow-300">{newNotification.title}</h4>
              <p className="text-slate-300">{newNotification.message}</p>
            </div>
          </motion.div>
        ));
        new Audio('/notification.mp3').play().catch(e => console.error("Error playing sound:", e));
      } catch (e) {
        console.error("Failed to parse websocket message", e, event.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, []);
  
  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900 flex items-stretch">
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar unreadCount={unreadCount} />
      <main className="flex-1 flex flex-col py-12 ml-32">
        <NotificationBell notifications={notifications} onMarkAsRead={handleMarkAsRead} />
        <ProfileButton user={user} />
        {children}
      </main>
    </div>
  );
};

export default Layout; 