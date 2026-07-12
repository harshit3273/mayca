import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaChartLine, FaEye, FaEyeSlash, FaUserTie, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get('type') === 'ca' ? 'ca' : 'client';
  
  const [activeTab, setActiveTab] = useState(initialType);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'ca' || type === 'client') {
      setActiveTab(type);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      
      // Strict tab enforcement
      if (activeTab === 'client' && (user.role === 'ca' || user.role === 'admin')) {
          toast.error("Invalid login. Staff must use the CA Login tab.");
          logout();
          setLoading(false);
          return;
      }
      
      if (activeTab === 'ca' && user.role === 'client') {
          toast.error("Invalid login. Clients must use the Client Login tab.");
          logout();
          setLoading(false);
          return;
      }

      toast.success(`Welcome back, ${user.name}!`);
      
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'ca') navigate('/ca');
      else navigate('/client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <FaChartLine className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl">CA Firm Portal</span>
        </Link>

        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Manage GST, ITR,<br />TDS & ROC<br />in one place.
          </h1>
          <p className="text-blue-200 text-lg">
            Streamline compliance, track deadlines, and communicate with clients — all from a single dashboard.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'GST Returns', desc: 'Track & file on time' },
              { label: 'ITR Filing', desc: 'Assessment year wise' },
              { label: 'TDS Management', desc: 'Section wise tracking' },
              { label: 'ROC Compliance', desc: 'Company filings' },
            ].map(f => (
              <div key={f.label} className="bg-white bg-opacity-10 rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-blue-200 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">© {new Date().getFullYear()} CA Firm Portal. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white text-lg" />
            </div>
            <span className="text-gray-900 font-bold text-xl">CA Firm Portal</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('client')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'client' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaUser /> Client Login
              </button>
              <button
                onClick={() => setActiveTab('ca')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ca' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaUserTie /> CA Login
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {activeTab === 'client' ? 'Client Sign In' : 'CA Sign In'}
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              {activeTab === 'client' ? 'Enter your credentials to access the client portal' : 'Enter your credentials to access the staff dashboard'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Demo hint */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
            <p className="font-semibold mb-1">First time?</p>
            <p>Clients can create a new account to access the Client Portal. CA accounts are provisioned by the Administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
