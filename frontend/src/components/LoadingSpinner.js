import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export default LoadingSpinner;
