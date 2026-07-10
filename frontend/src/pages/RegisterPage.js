import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChartLine, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

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
      navigate('/client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors";

  const Field = ({ icon, label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <FaChartLine className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl">CA Firm Portal</span>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome to Our<br />Client Portal
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Register your company to access your secure document vault and track your compliance in real-time.
          </p>
          <div className="space-y-4">
            {[
              '✓ Track GST, TDS, and ROC filings',
              '✓ Secure Document Uploads',
              '✓ Direct Communication with CAs',
              '✓ Automated Compliance Alerts',
              '✓ Instant Invoice Payments',
            ].map(f => (
              <p key={f} className="text-blue-100 text-sm">{f}</p>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© {new Date().getFullYear()} CA Firm Portal.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg py-6">
          <Link to="/" className="flex items-center gap-3 mb-6 lg:hidden hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-xl">CA Firm Portal</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to register</p>

            <form onSubmit={handleSubmit} className="space-y-4">


              <div className="grid grid-cols-2 gap-4">
                <Field icon={<FaUser />} label="Full Name *">
                  <input type="text" className={inputClass} placeholder="Rajesh Kumar"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </Field>

                <Field icon={<FaEnvelope />} label="Email *">
                  <input type="email" className={inputClass} placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </Field>

                <Field icon={<FaLock />} label="Password *">
                  <input type={showPass ? 'text' : 'password'} className={`${inputClass} pr-10`} placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </Field>

                <Field icon={<FaLock />} label="Confirm Password *">
                  <input type={showConfirm ? 'text' : 'password'} className={`${inputClass} pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : ''}`}
                    placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </Field>

                <Field icon={<FaPhone />} label="Phone">
                  <input type="tel" className={inputClass} placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </Field>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PAN Number</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      className={`${inputClass} font-mono uppercase ${form.pan && !PAN_REGEX.test(form.pan) ? 'border-red-400' : form.pan && PAN_REGEX.test(form.pan) ? 'border-green-400' : ''}`}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={form.pan}
                      onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    />
                  </div>
                  {form.pan && !PAN_REGEX.test(form.pan) && (
                    <p className="text-xs text-red-500 mt-1">{10 - form.pan.length > 0 ? `${10 - form.pan.length} more character(s) needed` : 'Invalid PAN format'}</p>
                  )}
                  {form.pan && PAN_REGEX.test(form.pan) && <p className="text-xs text-green-600 mt-1">✓ Valid PAN</p>}
                </div>

                <Field icon={<FaBuilding />} label="Business Name">
                  <input type="text" className={inputClass} placeholder="Acme Pvt Ltd"
                    value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
                </Field>
              </div>

              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 mt-2">
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
