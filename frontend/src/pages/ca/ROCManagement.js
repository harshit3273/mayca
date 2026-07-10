import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const ROCManagement = () => {
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: '', companyName: '', cinNumber: '', filingType: '', dueDate: '', filedDate: '', status: 'pending' });

  useEffect(() => {
    Promise.all([
      API.get('/roc').then(r => setRecords(r.data)),
      API.get('/clients?limit=100').then(r => setClients(r.data.clients))
    ]).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/roc', form);
      setRecords(prev => [data, ...prev]);
      toast.success('ROC record added');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          <FaPlus /> Add ROC Record
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">CIN</th>
                  <th className="text-left px-4 py-3">Filing Type</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-400">No ROC records</td></tr>
                ) : records.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.client?.name || r.client}</td>
                    <td className="px-4 py-3 text-gray-600">{r.companyName || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 text-xs">{r.cinNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.filingType || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
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
              <h3 className="font-semibold text-lg">Add ROC Record</h3>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <select className={inputClass} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required>
                <option value="">Select Client *</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Company Name" className={inputClass} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <input type="text" placeholder="CIN Number" className={inputClass} value={form.cinNumber} onChange={e => setForm({ ...form, cinNumber: e.target.value })} />
              <input type="text" placeholder="Filing Type (e.g. Annual Return)" className={inputClass} value={form.filingType} onChange={e => setForm({ ...form, filingType: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500">Due Date</label>
                  <input type="date" className={inputClass} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                <div><label className="text-xs text-gray-500">Filed Date</label>
                  <input type="date" className={inputClass} value={form.filedDate} onChange={e => setForm({ ...form, filedDate: e.target.value })} /></div>
              </div>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="filed">Filed</option>
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

export default ROCManagement;
