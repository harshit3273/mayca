import React from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    filed: 'bg-green-100 text-green-700',
    paid: 'bg-green-100 text-green-700',
    confirmed: 'bg-green-100 text-green-700',
    compliant: 'bg-green-100 text-green-700',
    processed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    outstanding: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    declined: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
    not_applicable: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
