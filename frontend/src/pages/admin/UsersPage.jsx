import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Mail, 
  User as UserIcon,
  Loader2,
  Check,
  X,
  MoreVertical,
  Key,
  Edit2
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    isActive: true
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Remove password if empty (don't update password)
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await axiosClient.put(`/users/${editingId}`, payload);
        toast.success('Staff account updated');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new accounts');
          setIsSubmitting(false);
          return;
        }
        await axiosClient.post('/users', formData);
        toast.success('Staff account created');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'receptionist',
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await axiosClient.delete(`/users/${id}`);
      toast.success('Account deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading staff portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage team access and permissions.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
        >
          <UserPlus size={20} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Users Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <ShieldCheck className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'text-orange-600' : 'text-blue-500'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {editingId ? "Edit Account" : "Add Team Member"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Grant dashboard access to your restaurant staff.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" required autoFocus
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="john@restaurant.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  {editingId && <span className="text-[10px] text-slate-400 font-normal">Leave blank to keep current</span>}
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input 
                    type="password" required={!editingId}
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                  <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Status</label>
                  <select 
                    value={formData.isActive ? 'true' : 'false'} 
                    onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? "Update Account" : "Create Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
