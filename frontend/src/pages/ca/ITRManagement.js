import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaSearch, FaEdit, FaRegFileAlt } from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = { client: '', assessmentYear: '', itrType: 'ITR-1', status: 'pending', dueDate: '', filedDate: '', refundStatus: 'not_applicable', refundAmount: 0, remarks: '' };

const ITRManagement = () => {
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    Promise.all([
      API.get('/itr').then(r => setRecords(r.data)),
      API.get('/clients?limit=200').then(r => setClients(r.data.clients))
    ]).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditRecord(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ client: r.client?._id || r.client, assessmentYear: r.assessmentYear || '', itrType: r.itrType, status: r.status, dueDate: r.dueDate ? r.dueDate.split('T')[0] : '', filedDate: r.filedDate ? r.filedDate.split('T')[0] : '', refundStatus: r.refundStatus, refundAmount: r.refundAmount || 0, remarks: r.remarks || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client) return toast.error('Please select a client');
    setSaving(true);
    try {
      if (editRecord) {
        const { data } = await API.put(`/itr/${editRecord._id}`, form);
        setRecords(prev => prev.map(r => r._id === data._id ? data : r));
        toast.success('ITR record updated');
      } else {
        const { data } = await API.post('/itr', form);
        setRecords(prev => [data, ...prev]);
        toast.success('ITR record added');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const filtered = records.filter(r => {
    const match = !search || (r.client?.name || '').toLowerCase().includes(search.toLowerCase()) || (r.assessmentYear || '').includes(search);
    return match && (filterStatus === 'all' || r.status === filterStatus);
  });

  const counts = { all: records.length, pending: records.filter(r => r.status === 'pending').length, filed: records.filter(r => r.status === 'filed').length, overdue: records.filter(r => r.status === 'overdue').length };
  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        {[['all', 'All', counts.all, 'bg-gray-100 text-gray-700'], ['pending', 'Pending', counts.pending, 'bg-yellow-100 text-yellow-700'], ['filed', 'Filed', counts.filed, 'bg-green-100 text-green-700'], ['overdue', 'Overdue', counts.overdue, 'bg-red-100 text-red-700']].map(([v, l, c, cls]) => (
          <button key={v} onClick={() => setFilterStatus(v)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${filterStatus === v ? 'border-blue-600 bg-blue-50 text-blue-700' : `${cls} border-transparent`}`}>{l} · {c}</button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input type="text" placeholder="Search by client or AY..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"><FaPlus /> Add ITR Record</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">AY</th>
                  <th className="text-left px-4 py-3">ITR Type</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Filed Date</th>
                  <th className="text-left px-4 py-3">Refund</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-12 text-gray-400"><FaRegFileAlt className="mx-auto text-3xl mb-2 opacity-20" /><p>No ITR records found</p></td></tr>
                ) : filtered.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.client?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{r.assessmentYear || '—'}</td>
                    <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{r.itrType}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.filedDate ? new Date(r.filedDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      {r.refundStatus !== 'not_applicable' ? (
                        <div>
                          <StatusBadge status={r.refundStatus} />
                          {r.refundAmount > 0 && <p className="text-xs text-green-600 font-semibold mt-0.5">₹{Number(r.refundAmount).toLocaleString('en-IN')}</p>}
                        </div>
                      ) : <span className="text-gray-300 text-xs">N/A</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3"><button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {records.length} records</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-bold text-lg">{editRecord ? 'Edit ITR Record' : 'Add ITR Record'}</h3><p className="text-sm text-gray-400 mt-0.5">Income Tax Return details</p></div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client *</label>
                <select className={inputClass} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.pan ? ` (${c.pan})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assessment Year</label>
                  <input type="text" className={inputClass} placeholder="e.g. 2024-25" value={form.assessmentYear} onChange={e => setForm({ ...form, assessmentYear: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ITR Type</label>
                  <select className={inputClass} value={form.itrType} onChange={e => setForm({ ...form, itrType: e.target.value })}>
                    {['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                  <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option><option value="filed">Filed</option><option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Refund Status</label>
                  <select className={inputClass} value={form.refundStatus} onChange={e => setForm({ ...form, refundStatus: e.target.value })}>
                    <option value="not_applicable">Not Applicable</option><option value="pending">Pending</option><option value="processed">Processed</option><option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</label>
                  <input type="date" className={inputClass} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filed Date</label>
                  <input type="date" className={inputClass} value={form.filedDate} onChange={e => setForm({ ...form, filedDate: e.target.value })} />
                </div>
              </div>
              {form.refundStatus !== 'not_applicable' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Refund Amount (₹)</label>
                  <input type="number" className={inputClass} placeholder="0" value={form.refundAmount} onChange={e => setForm({ ...form, refundAmount: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Remarks</label>
                <textarea className={inputClass} rows={2} placeholder="Optional notes" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm disabled:opacity-60">
                  {saving ? 'Saving...' : editRecord ? 'Update' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITRManagement;
