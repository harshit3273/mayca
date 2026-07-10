import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: '', description: '', amount: '', status: 'outstanding', dueDate: '', invoiceNumber: '' });

  useEffect(() => {
    Promise.all([
      API.get('/payments').then(r => setPayments(r.data)),
      API.get('/clients?limit=100').then(r => setClients(r.data.clients))
    ]).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/payments', form);
      setPayments(prev => [data, ...prev]);
      toast.success('Payment record added');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const totalOutstanding = payments
    .filter(p => p.status === 'outstanding' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          <FaPlus /> Add Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-left px-4 py-3">Invoice</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-400">No payment records</td></tr>
                ) : payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.client?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.description}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.invoiceNumber || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Add Payment Record</h3>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <select className={inputClass} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required>
                <option value="">Select Client *</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Description *" className={inputClass} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input type="number" placeholder="Amount (₹) *" className={inputClass} required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <input type="text" placeholder="Invoice Number" className={inputClass} value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} />
              <div><label className="text-xs text-gray-500">Due Date</label>
                <input type="date" className={inputClass} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="outstanding">Outstanding</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
