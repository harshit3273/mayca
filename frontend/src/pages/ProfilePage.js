import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
    FaUser, FaEnvelope, FaPhone, FaIdCard,
    FaBuilding, FaLock, FaSave, FaShieldAlt,
    FaEye, FaEyeSlash, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const ProfilePage = () => {
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        pan: user?.pan || '',
        businessName: user?.businessName || '',
        address: user?.address || '',
    });

    const [passwords, setPasswords] = useState({
        current: '', newPass: '', confirm: ''
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingPass, setSavingPass] = useState(false);

    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors";

    // ── Save profile ──────────────────────────────────────
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Name is required');
        if (form.pan && !PAN_REGEX.test(form.pan))
            return toast.error('Invalid PAN format. Must be like ABCDE1234F');

        setSaving(true);
        try {
            // Use the /auth/profile endpoint — works for BOTH CA and Client
            const { data } = await API.put('/auth/profile', form);

            // Update user in context + localStorage instantly
            updateUser({
                name: data.name,
                phone: data.phone,
                pan: data.pan,
                businessName: data.businessName,
                address: data.address,
            });

            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // ── Change password ────────────────────────────────────
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!passwords.current) return toast.error('Current password is required');
        if (passwords.newPass !== passwords.confirm)
            return toast.error('New passwords do not match');
        if (passwords.newPass.length < 6)
            return toast.error('Password must be at least 6 characters');

        setSavingPass(true);
        try {
            await API.put('/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.newPass
            });
            toast.success('Password changed successfully!');
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPass(false);
        }
    };

    const panValid = form.pan && PAN_REGEX.test(form.pan);
    const panInvalid = form.pan && !PAN_REGEX.test(form.pan);

    return (
        <div className="max-w-2xl space-y-6">

            {/* ── Profile header ── */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-white border-opacity-30">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate">{user?.name}</h2>
                        <p className="text-blue-200 text-sm capitalize mt-0.5">
                            {user?.role === 'ca' ? '👔 Chartered Accountant' : '👤 Client'}
                        </p>
                        <p className="text-blue-300 text-xs mt-0.5 truncate">{user?.email}</p>
                    </div>
                    {user?.pan && (
                        <div className="text-right hidden sm:block">
                            <p className="text-blue-200 text-xs">PAN</p>
                            <p className="text-white font-mono font-bold">{user.pan}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Personal information ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <FaUser className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                </div>

                <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Full Name *
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input type="text" className={`${inputClass} pl-9`}
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required />
                            </div>
                        </div>

                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input type="email"
                                    className={`${inputClass} pl-9 cursor-not-allowed opacity-60`}
                                    value={user?.email}
                                    disabled />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input type="tel" className={`${inputClass} pl-9`}
                                    placeholder="+91 98765 43210"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>

                        {/* PAN */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                PAN Number
                            </label>
                            <div className="relative">
                                <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type="text"
                                    className={`${inputClass} pl-9 font-mono tracking-widest ${panInvalid ? 'border-red-400 focus:ring-red-400' :
                                        panValid ? 'border-green-400 focus:ring-green-400' : ''
                                        }`}
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                    value={form.pan}
                                    onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                                />
                            </div>
                            {panInvalid && (
                                <p className="text-xs text-red-500 mt-1">
                                    {10 - form.pan.length > 0 ? `${10 - form.pan.length} more character(s) needed` : 'Invalid format — e.g. ABCDE1234F'}
                                </p>
                            )}
                            {panValid && <p className="text-xs text-green-600 mt-1">✓ Valid PAN</p>}
                            {!form.pan && <p className="text-xs text-gray-400 mt-1">5 letters + 4 digits + 1 letter</p>}
                        </div>

                    </div>

                    {/* Business name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Business / Firm Name
                        </label>
                        <div className="relative">
                            <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input type="text" className={`${inputClass} pl-9`}
                                placeholder="Acme Pvt Ltd"
                                value={form.businessName}
                                onChange={e => setForm({ ...form, businessName: e.target.value })} />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Address
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                            <textarea
                                className={`${inputClass} pl-9 resize-none`}
                                rows={2}
                                placeholder="Full address"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <><FaSave /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Change password ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <FaShieldAlt className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    {/* Current password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Current Password *
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                className={`${inputClass} pl-9 pr-10`}
                                placeholder="Enter your current password"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                required
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCurrent ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                New Password *
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    className={`${inputClass} pl-9 pr-10`}
                                    placeholder="Min 6 characters"
                                    value={passwords.newPass}
                                    onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showNew ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className={`${inputClass} pl-9 pr-10 ${passwords.confirm && passwords.newPass !== passwords.confirm ? 'border-red-400' :
                                        passwords.confirm && passwords.newPass === passwords.confirm && passwords.confirm.length >= 6 ? 'border-green-400' : ''
                                        }`}
                                    placeholder="Repeat new password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {passwords.confirm && passwords.newPass !== passwords.confirm && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                            {passwords.confirm && passwords.newPass === passwords.confirm && passwords.confirm.length >= 6 && (
                                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                            )}
                        </div>
                    </div>

                    {/* Password strength indicator */}
                    {passwords.newPass && (
                        <div>
                            <div className="flex gap-1 mt-1">
                                {[...Array(4)].map((_, i) => {
                                    const strength = passwords.newPass.length >= 6
                                        ? passwords.newPass.length >= 8
                                            ? passwords.newPass.match(/[A-Z]/) && passwords.newPass.match(/[0-9]/)
                                                ? passwords.newPass.match(/[^A-Za-z0-9]/) ? 4 : 3
                                                : 2
                                            : 1
                                        : 0;
                                    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
                                    return (
                                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`} />
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {passwords.newPass.length < 6 ? 'Too short' :
                                    passwords.newPass.length < 8 ? 'Weak — use 8+ characters' :
                                        !passwords.newPass.match(/[A-Z]/) || !passwords.newPass.match(/[0-9]/) ? 'Medium — add uppercase + numbers' :
                                            !passwords.newPass.match(/[^A-Za-z0-9]/) ? 'Good — add special characters for strong' : 'Strong password!'}
                            </p>
                        </div>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={savingPass}
                            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-60 transition-colors">
                            {savingPass ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <><FaShieldAlt /> Update Password</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default ProfilePage;
