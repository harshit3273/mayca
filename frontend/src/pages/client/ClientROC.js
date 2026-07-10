import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { FaBuilding } from 'react-icons/fa';

const ClientROC = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/roc').then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaBuilding className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">ROC Compliance</h3>
        </div>
        {loading ? <LoadingSpinner /> : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No ROC compliance records found. Contact your CA for updates.</div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-medium text-sm text-gray-900">{r.formType} — {r.financialYear || 'N/A'}</p>
                  <div className="flex gap-4 mt-1">
                    {r.filingDate && <p className="text-xs text-gray-400">Filed: {new Date(r.filingDate).toLocaleDateString('en-IN')}</p>}
                    {r.dueDate && <p className="text-xs text-gray-400">Due: {new Date(r.dueDate).toLocaleDateString('en-IN')}</p>}
                  </div>
                  {r.cinNumber && <p className="text-xs text-gray-400 mt-0.5 font-mono">CIN: {r.cinNumber}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientROC;
