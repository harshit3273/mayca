import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaChartLine, FaEye, FaEyeSlash,
  FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaBuilding
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// No Field wrapper to avoid any potential React reconciliation issues.
const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'client', phone: '', pan: '', businessName: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePAN = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setForm(prev => ({ ...prev, pan: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error('Name, email and password are required');
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (form.pan && !PAN_REGEX.test(form.pan))
      return toast.error('Invalid PAN — must be 10 chars like ABCDE1234F');

    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      navigate(user.role === 'ca' ? '/ca' : '/client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors";
  const panInvalid = form.pan && !PAN_REGEX.test(form.pan);
  const panValid = form.pan && PAN_REGEX.test(form.pan);

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <FaChartLine className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl">CA Firm Portal</span>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Join the CA<br />Firm Portal
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Create your account and get started with compliance management.
          </p>
          <div className="space-y-3">
            {[
              '✓ Secure JWT-based authentication',
              '✓ Role-based access control',
              '✓ Real-time notifications',
              '✓ Document upload & management',
              '✓ Compliance deadline tracking',
            ].map(f => (
              <p key={f} className="text-blue-100 text-sm">{f}</p>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© {new Date().getFullYear()} CA Firm Portal.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg py-6">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-6 lg:hidden hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-xl">CA Firm Portal</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to register</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>


              {/* Form fields grid */}
              <div className="grid grid-cols-2 gap-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="name"
                      className={inputClass}
                      placeholder="Rajesh Kumar"
                      value={form.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`${inputClass} pr-10 ${form.confirmPassword && form.password !== form.confirmPassword
                          ? 'border-red-400 focus:ring-red-400'
                          : form.confirmPassword && form.password === form.confirmPassword
                            ? 'border-green-400 focus:ring-green-400'
                            : ''
                        }`}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length >= 6 && (
                    <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="tel"
                      autoComplete="tel"
                      className={inputClass}
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange('phone')}
                    />
                  </div>
                </div>

                {/* PAN — handled manually, not via Field, to show validation below */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PAN Number</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="text"
                      className={`${inputClass} font-mono tracking-widest ${panInvalid ? 'border-red-400 focus:ring-red-400'
                          : panValid ? 'border-green-400 focus:ring-green-400'
                            : ''
                        }`}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={form.pan}
                      onChange={handlePAN}
                    />
                  </div>
                  {panInvalid && (
                    <p className="text-xs text-red-500 mt-1">
                      {10 - form.pan.length > 0
                        ? `${10 - form.pan.length} more character(s) needed`
                        : 'Invalid format — e.g. ABCDE1234F'}
                    </p>
                  )}
                  {panValid && <p className="text-xs text-green-600 mt-1">✓ Valid PAN</p>}
                  {!form.pan && <p className="text-xs text-gray-400 mt-1">5 letters + 4 digits + 1 letter</p>}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Acme Pvt Ltd"
                      value={form.businessName}
                      onChange={handleChange('businessName')}
                    />
                  </div>
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
