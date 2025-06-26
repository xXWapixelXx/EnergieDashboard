import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheck, FiTrash, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  is_read: boolean;
  created_at: string;
}

const Alerts = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      toast.error('Kon notificaties niet ophalen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      toast.success('Gemarkeerd als gelezen');
    } catch (error) {
      toast.error('Kon notificatie niet bijwerken.');
    }
  };
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-8 w-full text-white">
        <h1 className="text-3xl font-bold text-primary-100 mb-8">Notificatie Centrum</h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              {['all', 'unread', 'warning', 'info'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === f ? 'bg-sky-500 text-white shadow-md' : 'bg-white/20 hover:bg-white/30'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-red-500/80 hover:bg-red-600 transition-all">
              <FiTrash /> Alles Verwijderen
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <p>Laden...</p>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${n.is_read ? 'bg-white/10 border-white/20' : 'bg-sky-900/40 border-sky-500/50'}`}
                  >
                    <div className={`p-3 rounded-full ${ n.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-sky-500/20 text-sky-400'}`}>
                      <FiAlertTriangle size={24}/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{n.title}</h3>
                      <p className="text-primary-200 text-sm">{n.message}</p>
                      <span className="text-xs text-primary-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => handleMarkAsRead(n.id)} className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-400 transition-all" title="Mark as read">
                        <FiCheck size={20} />
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiCheck size={48} className="mx-auto text-green-400 mb-4" />
                  <h3 className="text-xl font-bold">Alles is rustig</h3>
                  <p className="text-primary-300">Geen notificaties om weer te geven.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Alerts; 