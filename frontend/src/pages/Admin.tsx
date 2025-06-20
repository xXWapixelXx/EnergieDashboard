import React, { useState, useEffect } from 'react';
import { FiUser, FiSearch, FiEdit, FiTrash2, FiPlus, FiShield, FiCheckCircle, FiXCircle, FiChevronDown, FiSettings, FiLogOut, FiDownload, FiBarChart2, FiRefreshCw, FiAlertTriangle, FiEye, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/auth';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Admin = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Alle rollen');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [trainingError, setTrainingError] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [addUserError, setAddUserError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number|null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserError, setEditUserError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('********************');
  const navigate = useNavigate();
  const user = authService.getUser();

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (e: any) {
      setUsersError(e.response?.data?.detail || 'Fout bij ophalen gebruikers');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user
  const handleAddUser = async () => {
    setAddUserError('');
    try {
      await axios.post(`${API_URL}/users/`, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAddingUser(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      // Refresh users
      const res = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch (e: any) {
      setAddUserError(e.response?.data?.detail || 'Fout bij toevoegen gebruiker');
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    setDeletingUserId(id);
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter((u: any) => u.id !== id));
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Fout bij verwijderen gebruiker');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setEditUserError('');
    try {
      await axios.put(`${API_URL}/users/${editingUser.id}`, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        is_active: editingUser.is_active,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEditingUser(null);
      fetchUsers(); // Refresh users list
    } catch (e: any) {
      setEditUserError(e.response?.data?.detail || 'Fout bij bijwerken gebruiker');
    }
  };

  const handleSendTestAlert = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/notifications/test-alert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Test alert succesvol verzonden!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Fout bij verzenden van test alert.');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u: any) =>
    (roleFilter === 'Alle rollen' || u.role === roleFilter) &&
    (`${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-8 w-full">
        <h1 className="text-3xl font-bold text-primary-100 mb-8">Admin Panel</h1>

        {/* User Management */}
        <section className="bg-white/20 rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-100">Gebruikersbeheer</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-all font-semibold" onClick={() => setAddingUser(true)}><FiPlus /> Nieuwe gebruiker</button>
          </div>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex items-center bg-white/30 rounded-xl px-3 py-2 gap-2">
              <FiSearch className="text-primary-400" />
              <input type="text" placeholder="Zoek gebruikers..." className="bg-transparent outline-none text-primary-900 placeholder-primary-400" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option>Alle rollen</option>
              <option>admin</option>
              <option>superadmin</option>
              <option>user</option>
            </select>
          </div>
          {usersLoading ? (
            <div className="text-primary-200">Laden...</div>
          ) : usersError ? (
            <div className="text-red-400">{usersError}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full text-primary-900 bg-white/60 rounded-xl">
                <thead>
                  <tr className="text-left text-primary-700 font-semibold">
                    <th className="py-3 px-4">Gebruiker</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Laatste login</th>
                    <th className="py-3 px-4">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-primary-200/30 hover:bg-primary-100/10 transition">
                      <td className="py-2 px-4 font-semibold flex items-center gap-2"><FiUser className="text-primary-400" /> {u.username}</td>
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-sky-500/20 text-sky-700' : u.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-700' : 'bg-purple-500/20 text-purple-700'}`}>{u.role}</span>
                      </td>
                      <td className="py-2 px-4">
                        {u.is_active ? <span className="flex items-center gap-1 text-green-600 font-semibold"><FiCheckCircle /> Actief</span> : <span className="flex items-center gap-1 text-gray-500 font-semibold"><FiXCircle /> Inactief</span>}
                      </td>
                      <td className="py-2 px-4">{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-primary-200/30" title="Bewerken" onClick={() => setEditingUser(u)}><FiEdit /></button>
                        <button className="p-2 rounded-lg hover:bg-red-200/40 text-red-700" title="Verwijderen" disabled={deletingUserId === u.id} onClick={() => handleDeleteUser(u.id)}>{deletingUserId === u.id ? <span className="animate-spin"><FiRefreshCw /></span> : <FiTrash2 />}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Add user modal */}
          {addingUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4">
                <h3 className="text-xl font-bold text-primary-900 mb-2">Nieuwe gebruiker toevoegen</h3>
                <input className="glass-input px-4 py-2 rounded-xl border border-primary-200" placeholder="Gebruikersnaam" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                <input className="glass-input px-4 py-2 rounded-xl border border-primary-200" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                <input className="glass-input px-4 py-2 rounded-xl border border-primary-200" placeholder="Wachtwoord" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                <select className="glass-input px-4 py-2 rounded-xl border border-primary-200" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">Gebruiker</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                {addUserError && <div className="text-red-500 text-sm">{addUserError}</div>}
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition" onClick={handleAddUser}>Toevoegen</button>
                  <button className="flex-1 px-4 py-2 rounded-xl bg-gray-200 text-primary-900 font-semibold shadow hover:bg-gray-300 transition" onClick={() => setAddingUser(false)}>Annuleren</button>
                </div>
              </div>
            </div>
          )}
          {/* Edit user modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4">
                <h3 className="text-xl font-bold text-primary-900 mb-2">Gebruiker Bewerken</h3>
                <input 
                  className="glass-input px-4 py-2 rounded-xl border border-primary-200" 
                  placeholder="Gebruikersnaam" 
                  value={editingUser.username} 
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} 
                />
                <input 
                  className="glass-input px-4 py-2 rounded-xl border border-primary-200" 
                  placeholder="Email" 
                  value={editingUser.email} 
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} 
                />
                <select 
                  className="glass-input px-4 py-2 rounded-xl border border-primary-200" 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="user">Gebruiker</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_active_checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    checked={editingUser.is_active} 
                    onChange={e => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active_checkbox" className="text-primary-900">Actief</label>
                </div>
                {editUserError && <div className="text-red-500 text-sm">{editUserError}</div>}
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition" onClick={handleUpdateUser}>Opslaan</button>
                  <button className="flex-1 px-4 py-2 rounded-xl bg-gray-200 text-primary-900 font-semibold shadow hover:bg-gray-300 transition" onClick={() => setEditingUser(null)}>Annuleren</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {user?.role === 'superadmin' && (
          <>
            {/* AI Model Management */}
            <section className="bg-white/20 rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
              <h2 className="text-xl font-bold text-primary-100 mb-4">AI Model Beheer (Mistral)</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-primary-100 font-semibold" htmlFor="ai-enabled">
                    AI Voorspellingen Inschakelen
                  </label>
                  <div 
                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${aiEnabled ? 'bg-sky-500' : 'bg-gray-400'}`}
                    onClick={() => setAiEnabled(!aiEnabled)}
                  >
                    <motion.div 
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      layout
                      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                      initial={false}
                      animate={{ x: aiEnabled ? 24 : 0 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-primary-100 font-semibold mb-2" htmlFor="api-key">
                    Mistral API Sleutel
                  </label>
                  <input
                    id="api-key"
                    type="text"
                    className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Voer je API sleutel in"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-all font-semibold">
                    <FiCheckCircle /> Instellingen Opslaan
                  </button>
                </div>
              </div>
            </section>

            {/* Training History */}
            <section className="bg-white/20 rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-primary-100 mb-4">Training Geschiedenis</h2>
              <div className="text-center py-8 bg-white/30 rounded-xl">
                <FiBarChart2 className="mx-auto text-4xl text-primary-400 mb-2" />
                <p className="text-primary-200">Geen trainingsgeschiedenis gevonden.</p>
              </div>
            </section>

            {/* System Tools */}
            <section className="bg-white/20 rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-primary-100 mb-4">Systeem Tools</h2>
              <div className="flex gap-4">
                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105 transition-all font-semibold"
                  onClick={handleSendTestAlert}
                >
                  <FiSend /> Test Notificatie Verzenden
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Admin; 