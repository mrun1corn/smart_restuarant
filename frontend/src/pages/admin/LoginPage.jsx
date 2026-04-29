import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { LogIn, Loader2, UtensilsCrossed } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Unable to sign in. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo / Header */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 mb-4">
            <UtensilsCrossed className="text-white h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Resto</h1>
          <p className="text-slate-500 text-sm mt-1">Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800">Staff Login</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to manage your restaurant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                placeholder="admin@restaurant.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-slate-400 text-xs">
            &copy; 2026 Smart Restaurant System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
