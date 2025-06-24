import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FiUser, FiBell, FiShield, FiImage, FiGlobe, FiLock, FiCamera, FiCheckCircle, FiLoader, FiCpu, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/auth';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Settings = () => {
  const location = useLocation();
  const getSectionFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('section') || 'profile';
  };
  const [activeSection, setActiveSection] = useState(getSectionFromQuery());

  useEffect(() => {
    setActiveSection(getSectionFromQuery());
    // eslint-disable-next-line
  }, [location.search]);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const user = authService.getUser();
  
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username}`,
  });
  
  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [devices, setDevices] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [deviceVisibility, setDeviceVisibility] = useState<{ [key: string]: boolean }>({});

  // Fetch devices on mount
  useEffect(() => {
    if (activeSection === 'devices') {
      setDevicesLoading(true);
      axios.get(`${API_URL}/api/devices/usage`).then(res => {
        setDevices(res.data);
        // Load visibility from localStorage or default to true
        const vis = JSON.parse(localStorage.getItem('deviceVisibility') || '{}');
        const newVis: { [key: string]: boolean } = {};
        res.data.forEach((d: any) => {
          newVis[d.id] = vis[d.id] !== undefined ? vis[d.id] : true;
        });
        setDeviceVisibility(newVis);
      }).finally(() => setDevicesLoading(false));
    }
  }, [activeSection]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/me`, {
        username: profile.username,
        email: profile.email,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profiel succesvol bijgewerkt!');
      // Optionally, update local user state if your authService supports it
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fout bij bijwerken profiel.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new_password !== password.confirm_password) {
      toast.error('Nieuwe wachtwoorden komen niet overeen.');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/users/me/change-password`, {
        current_password: password.current_password,
        new_password: password.new_password,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Wachtwoord succesvol gewijzigd!');
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fout bij wijzigen wachtwoord.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleDevice = (deviceId: string) => {
    const newVis = { ...deviceVisibility, [deviceId]: !deviceVisibility[deviceId] };
    setDeviceVisibility(newVis);
    localStorage.setItem('deviceVisibility', JSON.stringify(newVis));
  };

  const navItems = [
    { id: 'profile', label: 'Profiel', icon: FiUser },
    { id: 'notifications', label: 'Notificaties', icon: FiBell },
    { id: 'security', label: 'Beveiliging', icon: FiShield },
    { id: 'devices', label: 'Apparaten', icon: FiCpu },
    { id: 'appearance', label: 'Uiterlijk', icon: FiImage },
    { id: 'language', label: 'Taal & Regio', icon: FiGlobe },
  ];

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-8 w-full">
        <h1 className="text-3xl font-bold text-primary-100 mb-8">Instellingen</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="col-span-1">
            <div className="bg-white/10 rounded-2xl shadow-xl p-4 border border-white/20">
              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-primary-100 font-semibold rounded-lg transition-all text-left ${activeSection === item.id ? 'bg-sky-500/30' : 'hover:bg-sky-500/20'}`}
                  >
                    <item.icon className={`text-sky-400 ${activeSection === item.id ? 'scale-110' : ''} transition-transform`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="col-span-1 lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'profile' && (
                  <section id="profile" className="bg-gradient-to-br from-purple-700/60 to-sky-700/40 rounded-2xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-primary-100 mb-6">Profielinstellingen</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-primary-100 font-semibold mb-2" htmlFor="username">Gebruikersnaam</label>
                          <input
                            id="username"
                            type="text"
                            className="glass-input w-full px-4 py-2 rounded-xl border-2 border-sky-400/40 focus:border-sky-500 bg-white/80 text-primary-900 font-medium shadow-md focus:ring-2 focus:ring-sky-300 transition"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            disabled={profileLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-primary-100 font-semibold mb-2" htmlFor="email">Email</label>
                          <input
                            id="email"
                            type="email"
                            className="glass-input w-full px-4 py-2 rounded-xl border-2 border-sky-400/40 focus:border-sky-500 bg-white/80 text-primary-900 font-medium shadow-md focus:ring-2 focus:ring-sky-300 transition"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={profileLoading}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-base font-semibold shadow-lg bg-gradient-to-r from-sky-500 to-purple-600 text-white hover:from-sky-400 hover:to-purple-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-sky-300" disabled={profileLoading}>
                          {profileLoading ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                          {profileLoading ? 'Opslaan...' : 'Profiel Opslaan'}
                        </button>
                      </div>
                    </form>
                  </section>
                )}

                {activeSection === 'security' && (
                  <section id="security" className="bg-gradient-to-br from-purple-700/60 to-sky-700/40 rounded-2xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-primary-100 mb-6">Wachtwoord Wijzigen</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-primary-100 font-semibold mb-2" htmlFor="current-password">Huidig Wachtwoord</label>
                        <input
                          id="current-password"
                          type="password"
                          className="glass-input w-full px-4 py-2 rounded-xl border-2 border-sky-400/40 focus:border-sky-500 bg-white/80 text-primary-900 font-medium shadow-md focus:ring-2 focus:ring-sky-300 transition"
                          value={password.current_password}
                          onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-primary-100 font-semibold mb-2" htmlFor="new-password">Nieuw Wachtwoord</label>
                        <input
                          id="new-password"
                          type="password"
                          className="glass-input w-full px-4 py-2 rounded-xl border-2 border-sky-400/40 focus:border-sky-500 bg-white/80 text-primary-900 font-medium shadow-md focus:ring-2 focus:ring-sky-300 transition"
                          value={password.new_password}
                          onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-primary-100 font-semibold mb-2" htmlFor="confirm-password">Bevestig Nieuw Wachtwoord</label>
                        <input
                          id="confirm-password"
                          type="password"
                          className="glass-input w-full px-4 py-2 rounded-xl border-2 border-sky-400/40 focus:border-sky-500 bg-white/80 text-primary-900 font-medium shadow-md focus:ring-2 focus:ring-sky-300 transition"
                          value={password.confirm_password}
                          onChange={(e) => setPassword({ ...password, confirm_password: e.target.value })}
                          disabled={passwordLoading}
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-base font-semibold shadow-lg bg-gradient-to-r from-sky-500 to-purple-600 text-white hover:from-sky-400 hover:to-purple-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-sky-300" disabled={passwordLoading}>
                          {passwordLoading ? <FiLoader className="animate-spin" /> : <FiLock />}
                          {passwordLoading ? 'Wijzigen...' : 'Wachtwoord Wijzigen'}
                        </button>
                      </div>
                    </form>
                  </section>
                )}
                
                {activeSection === 'devices' && (
                  <section id="devices" className="bg-gradient-to-br from-purple-700/60 to-sky-700/40 rounded-2xl shadow-2xl p-8 border border-white/20 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-primary-100 mb-6 flex items-center gap-2"><FiCpu /> Apparaten</h2>
                    {devicesLoading ? (
                      <div className="flex items-center gap-2 text-primary-200"><FiLoader className="animate-spin" /> Laden...</div>
                    ) : (
                      <div className="space-y-4">
                        {devices.length === 0 && <div className="text-primary-200">Geen apparaten gevonden.</div>}
                        {devices.map((device: any) => {
                          const Icon = FiIcons[device.icon] || FiCpu;
                          return (
                            <div key={device.id} className="flex items-center justify-between bg-white/10 rounded-xl p-4 shadow border border-white/10">
                              <div className="flex items-center gap-4">
                                <Icon className="text-2xl text-sky-400" />
                                <div>
                                  <div className="font-bold text-primary-100 text-lg">{device.label}</div>
                                  <div className="text-primary-300 text-sm">Gebruik: {device.usage !== null ? `${device.usage.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${device.unit}` : 'n.v.t.'}</div>
                                </div>
                              </div>
                              <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow transition-all ${deviceVisibility[device.id] ? 'bg-gradient-to-r from-sky-500 to-purple-600 text-white' : 'bg-gray-200 text-primary-900'}`}
                                onClick={() => handleToggleDevice(device.id)}
                              >
                                <FiEye className={deviceVisibility[device.id] ? '' : 'opacity-40'} />
                                {deviceVisibility[device.id] ? 'Toon in Dashboard' : 'Verborgen'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {/* Placeholder for other sections */}
                {(activeSection === 'notifications' || activeSection === 'appearance' || activeSection === 'language') && (
                  <section className="bg-white/10 rounded-2xl shadow-xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-primary-100 mb-6 capitalize">{activeSection}</h2>
                    <p className="text-primary-200">Deze sectie is binnenkort beschikbaar.</p>
                  </section>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 