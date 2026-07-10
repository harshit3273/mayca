import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { FaMoneyCheckAlt, FaRupeeSign, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const fetchPayments = () => {
    API.get('/payments').then(r => setPayments(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSimulatePayment = async (p) => {
    setPayingId(p._id);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update payment status via API
      await API.put(`/payments/${p._id}`, { status: 'paid' });
      toast.success(`Payment of ₹${p.amount} for ${p.description} successful!`);
      
      fetchPayments();
    } catch (err) {
      toast.error('Payment simulation failed.');
    } finally {
      setPayingId(null);
    }
  };

  const totalDue = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Due Summary */}
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between ${totalDue > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${totalDue > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <FaRupeeSign />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Outstanding Due</p>
            <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{totalDue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        {totalDue === 0 && (
          <div className="text-green-600 flex items-center gap-2 font-medium">
            <FaCheckCircle /> All Dues Cleared
          </div>
        )}
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <FaMoneyCheckAlt className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Payment History & Invoices</h3>
        </div>
        {loading ? <LoadingSpinner /> : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No payment records found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map(p => (
              <div key={p._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50 transition-colors gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-lg">{p.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="font-bold text-gray-900">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                    <span className="text-gray-300">|</span>
                    {p.dueDate && <span className="text-xs text-gray-500">Due: {new Date(p.dueDate).toLocaleDateString('en-IN')}</span>}
                    <span className="text-gray-300">|</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                {p.status !== 'paid' && (
                  <button 
                    onClick={() => handleSimulatePayment(p)}
                    disabled={payingId === p._id}
                    className="flex-shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {payingId === p._id ? <><FaSpinner className="animate-spin" /> Processing...</> : 'Pay Now'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPayments;
