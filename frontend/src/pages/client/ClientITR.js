import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { FaRegFileAlt } from 'react-icons/fa';

const ClientITR = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/itr').then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaRegFileAlt className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">ITR Filing History</h3>
        </div>
        {loading ? <LoadingSpinner /> : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No ITR records found. Contact your CA for updates.</div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.itrType} — AY {r.assessmentYear || 'N/A'}</p>
                    <div className="flex flex-wrap gap-4 mt-1">
                      {r.dueDate && <p className="text-xs text-gray-400">Due: {new Date(r.dueDate).toLocaleDateString('en-IN')}</p>}
                      {r.filedDate && <p className="text-xs text-green-600">Filed: {new Date(r.filedDate).toLocaleDateString('en-IN')}</p>}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.refundStatus && r.refundStatus !== 'not_applicable' && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Refund:</p>
                    <StatusBadge status={r.refundStatus} />
                    {r.refundAmount > 0 && <p className="text-xs font-semibold text-green-600">₹{Number(r.refundAmount).toLocaleString('en-IN')}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientITR;
