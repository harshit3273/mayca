import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChartLine, FaFileInvoiceDollar, FaRegFileAlt, FaMoneyCheckAlt,
    FaBuilding, FaBell, FaRobot, FaCalendarAlt, FaComments, FaUpload,
    FaShieldAlt, FaMobile, FaUsers, FaBars, FaTimes, FaCalculator,
    FaArrowRight, FaCheckCircle, FaWhatsapp, FaEnvelope, FaPhone, FaRupeeSign
} from 'react-icons/fa';

/* ── tiny helpers ── */
const Tag = ({ children }) => (
    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
        {children}
    </span>
);

const FeatureCard = ({ icon, title, desc, color }) => (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const LandingPage = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="font-sans text-gray-900 overflow-x-hidden">

            {/* ═══════════════ NAVBAR ═══════════════ */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <FaChartLine className="text-white text-sm" />
                        </div>
                        <span className={`font-bold text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                            MayCA
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How it Works', 'Contact'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                className={`text-sm font-medium hover:text-blue-500 transition-colors ${scrolled ? 'text-gray-600' : 'text-blue-100 hover:text-white'}`}>
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="relative group">
                            <button
                                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1 ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white hover:bg-opacity-20'}`}>
                                Login
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                <div className="py-2">
                                    <Link to="/login?type=client" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium">Client Login</Link>
                                    <Link to="/login?type=ca" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium">CA Login</Link>
                                </div>
                            </div>
                        </div>
                        <Link to="/register"
                            className="text-sm font-semibold px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                            Become a Client →
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden p-2 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen
                            ? <FaTimes className={scrolled ? 'text-gray-700' : 'text-white'} />
                            : <FaBars className={scrolled ? 'text-gray-700' : 'text-white'} />
                        }
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
                        {['Features', 'How it Works', 'Contact'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                onClick={() => setMenuOpen(false)}
                                className="block py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                                {item}
                            </a>
                        ))}
                        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Link to="/login?type=client" className="text-center py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700">Client Login</Link>
                                <Link to="/login?type=ca" className="text-center py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700">CA Login</Link>
                            </div>
                            <Link to="/register" className="w-full text-center py-2.5 bg-blue-600 rounded-xl text-sm font-medium text-white">Become a Client</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 text-center">
                    <Tag>Your Trusted Financial Partner 🇮🇳</Tag>

                    <h1 className="mt-6 text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                        Manage GST, ITR,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                            TDS & ROC
                        </span>
                        <br />in One Secure Portal
                    </h1>

                    <p className="mt-6 text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
                        The complete compliance management platform for our clients.
                        Track deadlines, upload documents, and view your tax status — all from a single dashboard.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base">
                            Create Client Account <FaArrowRight />
                        </Link>
                        <Link to="/login"
                            className="inline-flex items-center justify-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-opacity-20 transition-all text-base backdrop-blur-sm">
                            Sign In to Portal
                        </Link>
                    </div>

                    {/* Dashboard preview mockup */}
                    <div className="mt-16 relative max-w-5xl mx-auto">
                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl border border-white border-opacity-20 p-4 shadow-2xl">
                            <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                {/* Fake browser bar */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="flex-1 mx-4 bg-gray-700 rounded-lg px-3 py-1.5 text-gray-400 text-xs text-left">
                                        portal.ourfirm.in/client
                                    </div>
                                </div>
                                {/* Dashboard preview */}
                                <div className="bg-slate-50 p-4 text-left">
                                    {/* Mini stat cards */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {[
                                            { label: 'GST Filed', val: 'July 2023', color: 'bg-green-500' },
                                            { label: 'Pending ITR', val: '2', color: 'bg-yellow-500' },
                                            { label: 'Documents', val: '14', color: 'bg-purple-500' },
                                            { label: 'Amount Due', val: '₹12,400', color: 'bg-red-500' },
                                        ].map(s => (
                                            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm">
                                                <div className={`w-6 h-6 ${s.color} rounded-lg mb-2`} />
                                                <p className="text-xs text-gray-400">{s.label}</p>
                                                <p className="font-bold text-gray-900 text-sm">{s.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Mini chart bars */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <p className="text-xs font-semibold text-gray-500 mb-3">Monthly GST Filings</p>
                                        <div className="flex items-end gap-2 h-16">
                                            {[40, 65, 50, 80, 70, 90, 60, 85, 75, 95, 88, 70].map((h, i) => (
                                                <div key={i} className="flex-1 bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                                    style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating badges */}
                        <div className="absolute -left-6 top-1/3 bg-white rounded-2xl shadow-xl p-3 items-center gap-2 hidden md:flex">
                            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                                <FaCheckCircle className="text-green-500 text-sm" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900">GST Filed!</p>
                                <p className="text-xs text-gray-400">July Return Processed</p>
                            </div>
                        </div>
                        <div className="absolute -right-6 top-1/4 bg-white rounded-2xl shadow-xl p-3 items-center gap-2 hidden md:flex">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaBell className="text-blue-500 text-sm" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900">ITR Due in 3 days</p>
                                <p className="text-xs text-gray-400">Reminder from CA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FEATURES ═══════════════ */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Tag>Everything You Need</Tag>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-4">
                            Your Personal Compliance Dashboard
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Every feature designed to give you transparency and control over your tax filings and corporate compliance.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon={<FaMoneyCheckAlt className="text-teal-600" />} color="bg-teal-50" title="TDS Records" desc="Keep track of your quarterly TDS deductions, due dates, and filing status in a dedicated tab." />
                        <FeatureCard icon={<FaBuilding className="text-indigo-600" />} color="bg-indigo-50" title="ROC Compliance" desc="Track your company's annual ROC filings, CIN records, and stay compliant with MCA regulations." />
                        <FeatureCard icon={<FaFileInvoiceDollar className="text-blue-600" />} color="bg-blue-50" title="GST Status" desc="View your GST filing history, current status, next due date, and get alerts when filings are approaching." />
                        <FeatureCard icon={<FaRegFileAlt className="text-purple-600" />} color="bg-purple-50" title="ITR Status" desc="Track your income tax returns assessment year wise. See refund status and amounts processed." />
                        <FeatureCard icon={<FaUpload className="text-green-600" />} color="bg-green-50" title="Document Center" desc="Securely upload PDF and Excel documents to us. View and download reports published by our team." />
                        <FeatureCard icon={<FaRupeeSign className="text-red-600" />} color="bg-red-50" title="Online Payments" desc="See all outstanding dues and instantly clear them using our integrated Pay Now checkout simulator." />
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Tag>Simple Process</Tag>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-4">Get Started in Minutes</h2>
                        <p className="text-gray-500 text-lg">Set up your client portal in 3 easy steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200" />

                        {[
                            { step: '01', icon: <FaUsers className="text-blue-600 text-2xl" />, title: 'Create Your Account', desc: 'Register securely in our portal. Provide your basic business details to get started instantly.', color: 'bg-blue-50 border-blue-100' },
                            { step: '02', icon: <FaUpload className="text-green-600 text-2xl" />, title: 'Upload Documents', desc: 'Securely upload your invoices, bank statements, and previous returns to your private vault.', color: 'bg-green-50 border-green-100' },
                            { step: '03', icon: <FaCheckCircle className="text-purple-600 text-2xl" />, title: 'Track Compliance', desc: 'Monitor your GST, ITR, and ROC filings in real-time. Receive automated alerts for due dates.', color: 'bg-purple-50 border-purple-100' },
                        ].map(step => (
                            <div key={step.step} className={`relative rounded-2xl p-8 border-2 ${step.color}`}>
                                <div className="absolute -top-4 left-8 bg-white border-2 border-gray-200 rounded-xl px-3 py-1 text-xs font-black text-gray-500">
                                    STEP {step.step}
                                </div>
                                <div className="mt-4 mb-4">{step.icon}</div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA BANNER ═══════════════ */}
            <section className="py-24 bg-gradient-to-br from-blue-700 to-indigo-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="relative max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Ready to simplify your tax compliance?
                    </h2>
                    <p className="text-blue-200 text-lg mb-10">
                        Join our digital portal to experience seamless compliance tracking and advisory.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-base">
                            Create Client Account <FaArrowRight />
                        </Link>
                        <Link to="/login"
                            className="inline-flex items-center justify-center gap-2 border-2 border-white border-opacity-50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white hover:bg-opacity-10 transition-all text-base">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════ CONTACT ═══════════════ */}
            <section id="contact" className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <Tag>Get in Touch</Tag>
                        <h2 className="text-3xl font-black text-gray-900 mt-4">Contact Us</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <FaEnvelope className="text-blue-500 text-xl" />, title: 'Email', val: 'contact@ourfirm.in', href: 'mailto:contact@ourfirm.in' },
                            { icon: <FaPhone className="text-green-500 text-xl" />, title: 'Phone', val: '+91 90263 41042', href: 'tel:+919026341042' },
                            { icon: <FaWhatsapp className="text-green-500 text-xl" />, title: 'WhatsApp', val: '+91 90263 41042', href: 'https://wa.me/919026341042' },
                        ].map(c => (
                            <a key={c.title} href={c.href} target="_blank" rel="noreferrer"
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md text-center transition-shadow">
                                <div className="flex justify-center mb-3">{c.icon}</div>
                                <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                                <p className="text-gray-500 text-sm mt-1">{c.val}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <FaChartLine className="text-white text-xs" />
                                </div>
                                <span className="text-white font-bold">MayCA</span>
                            </div>
                            <p className="text-sm leading-relaxed">The complete compliance management platform for our clients.</p>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm mb-4">Platform</p>
                            <ul className="space-y-2 text-sm">
                                {['Client Portal', 'GST Tracking', 'ITR Status', 'TDS Records'].map(l => (
                                    <li key={l}><a href="#features" className="hover:text-white transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm mb-4">Company</p>
                            <ul className="space-y-2 text-sm">
                                {['About Us', 'Contact'].map(l => (
                                    <li key={l}><a href="#contact" className="hover:text-white transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm mb-4">Legal</p>
                            <ul className="space-y-2 text-sm">
                                {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
                                    <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm">© {new Date().getFullYear()} MayCA. All rights reserved.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
