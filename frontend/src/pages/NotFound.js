import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
    const { user } = useAuth();
    const home = user?.role === 'ca' ? '/ca' : user ? '/client' : '/login';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-10 rounded-3xl mb-6">
                    <FaExclamationTriangle className="text-yellow-400 text-4xl" />
                </div>
                <h1 className="text-8xl font-black text-white mb-4">404</h1>
                <p className="text-xl font-semibold text-blue-200 mb-2">Page Not Found</p>
                <p className="text-blue-300 text-sm mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to={home}
                    className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                    <FaHome /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
