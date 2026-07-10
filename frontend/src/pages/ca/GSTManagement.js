import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaSearch, FaEdit, FaFileInvoiceDollar } from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const EMPTY = { client: '', gstNumber: '', filingPeriod: '', status: 'pending', lastFiledDate: '', nextDueDate: '', returnType: 'GSTR-3B', remarks: '' };

const GSTManagement = () => {
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
      API.get('/gst').then(r => setRecords(r.data)),
      API.get('/clients?limit=200').then(r => setClients(r.data.clients))
    ]).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditRecord(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => { setEditRecord(r); setForm({ client: r.client?._id || r.client, gstNumber: r.gstNumber || '', filingPeriod: r.filingPeriod || '', status: r.status, lastFiledDate: r.lastFiledDate ? r.lastFiledDate.split('T')[0] : '', nextDueDate: r.nextDueDate ? r.nextDueDate.split('T')[0] : '', returnType: r.returnType, remarks: r.remarks || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client) return toast.error('Please select a client');
    setSaving(true);
    try {
      if (editRecord) {
        const { data } = await API.put(`/gst/${editRecord._id}`, form);
        setRecords(prev => prev.map(r => r._id === data._id ? data : r));
        toast.success('GST record updated');
      } else {
        const { data } = await API.post('/gst', form);
        setRecords(prev => [data, ...prev]);
        toast.success('GST record added');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const filtered = records.filter(r => {
    const clientName = r.client?.name || '';
    const matchSearch = !search || clientName.toLowerCase().includes(search.toLowerCase()) || (r.gstNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { all: records.length, pending: records.filter(r => r.status === 'pending').length, filed: records.filter(r => r.status === 'filed').length, overdue: records.filter(r => r.status === 'overdue').length };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[['all', 'All', counts.all, 'bg-gray-100 text-gray-700'], ['pending', 'Pending', counts.pending, 'bg-yellow-100 text-yellow-700'], ['filed', 'Filed', counts.filed, 'bg-green-100 text-green-700'], ['overdue', 'Overdue', counts.overdue, 'bg-red-100 text-red-700']].map(([v, l, c, cls]) => (
          <button key={v} onClick={() => setFilterStatus(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${filterStatus === v ? 'border-blue-600 bg-blue-50 text-blue-700' : `${cls} border-transparent`}`}>
            {l} · {c}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input type="text" placeholder="Search by client or GST number..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <FaPlus /> Add GST Record
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">GST Number</th>
                  <th className="text-left px-4 py-3">Period</th>
                  <th className="text-left px-4 py-3">Return Type</th>
                  <th className="text-left px-4 py-3">Last Filed</th>
                  <th className="text-left px-4 py-3">Next Due</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-12 text-gray-400">
                    <FaFileInvoiceDollar className="mx-auto text-3xl mb-2 opacity-20" />
                    No GST records found
                  </td></tr>
                ) : filtered.map(r => {
                  const isOverdue = r.nextDueDate && new Date(r.nextDueDate) < new Date() && r.status !== 'filed';
                  return (
                    <tr key={r._id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.client?.name || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.gstNumber || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{r.filingPeriod || '—'}</td>
                      <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{r.returnType}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.lastFiledDate ? new Date(r.lastFiledDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {r.nextDueDate ? (
                          <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {new Date(r.nextDueDate).toLocaleDateString('en-IN')}
                            {isOverdue && ' ⚠'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {records.length} records
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg">{editRecord ? 'Edit GST Record' : 'Add GST Record'}</h3>
                <p className="text-sm text-gray-400 mt-0.5">GST filing details</p>
              </div>
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">GST Number</label>
                  <input type="text" className={`${inputClass} font-mono uppercase`} placeholder="22AAAAA0000A1Z5" maxLength={15} value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Return Type</label>
                  <select className={inputClass} value={form.returnType} onChange={e => setForm({ ...form, returnType: e.target.value })}>
                    {['GSTR-1', 'GSTR-3B', 'GSTR-4', 'GSTR-9', 'GSTR-9C'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Period</label>
                  <input type="text" className={inputClass} placeholder="e.g. Oct 2024" value={form.filingPeriod} onChange={e => setForm({ ...form, filingPeriod: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                  <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="filed">Filed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Last Filed Date</label>
                  <input type="date" className={inputClass} value={form.lastFiledDate} onChange={e => setForm({ ...form, lastFiledDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Next Due Date</label>
                  <input type="date" className={inputClass} value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Remarks</label>
                <textarea className={inputClass} rows={2} placeholder="Optional notes" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Saving...' : editRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTManagement;
