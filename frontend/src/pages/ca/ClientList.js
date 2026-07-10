import React, { useEffect, useState, useCallback } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTimes, FaTrash, FaEye,
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaBuilding,
  FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  pan: '', businessName: '', address: ''
};

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteHard, setDeleteHard] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch clients ──────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, page, limit: 10,
        ...(filterStatus !== 'all' ? { isActive: filterStatus === 'active' } : {})
      });
      const { data } = await API.get(`/clients?${params}`);
      setClients(data.clients);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [search, page, filterStatus]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  // ── Open modals ────────────────────────────────────────────
  const openAdd = () => {
    setEditClient(null);
    setForm(emptyForm);
    setShowFormModal(true);
  };

  const openEdit = (c, e) => {
    e.stopPropagation();
    setEditClient(c);
    setForm({
      name: c.name, email: c.email, password: '',
      phone: c.phone || '', pan: c.pan || '',
      businessName: c.businessName || '', address: c.address || ''
    });
    setShowFormModal(true);
  };

  const openView = (c) => {
    setViewClient(c);
    setShowDetailModal(true);
  };

  const openDelete = (c, hard = false, e) => {
    e.stopPropagation();
    setDeleteTarget(c);
    setDeleteHard(hard);
    setShowDeleteModal(true);
  };

  // ── Save (add / edit) ──────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.pan && !PAN_REGEX.test(form.pan))
      return toast.error('Invalid PAN. Must be 10 characters like ABCDE1234F');

    setSaving(true);
    try {
      if (editClient) {
        const { data } = await API.put(`/clients/${editClient._id}`, form);
        setClients(prev => prev.map(c => c._id === data._id ? data : c));
        toast.success('Client updated successfully');
      } else {
        await API.post('/clients', form);
        toast.success('Client created successfully');
        fetchClients();
      }
      setShowFormModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active / inactive ───────────────────────────────
  const toggleActive = async (c, e) => {
    e.stopPropagation();
    try {
      const { data } = await API.put(`/clients/${c._id}`, { isActive: !c.isActive });
      setClients(prev => prev.map(cl => cl._id === data._id ? data : cl));
      toast.success(`Client ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/clients/${deleteTarget._id}${deleteHard ? '?hard=true' : ''}`);
      toast.success(deleteHard ? 'Client permanently deleted' : 'Client deactivated');
      setShowDeleteModal(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or PAN..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <FaPlus /> Add Client
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex gap-3 text-sm text-gray-500">
        <span>Total: <strong className="text-gray-900">{total}</strong></span>
        <span>·</span>
        <span>Active: <strong className="text-green-600">{clients.filter(c => c.isActive).length}</strong></span>
        <span>·</span>
        <span>Inactive: <strong className="text-red-500">{clients.filter(c => !c.isActive).length}</strong></span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">PAN</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Business</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      <FaUser className="mx-auto text-3xl mb-2 opacity-20" />
                      <p>No clients found</p>
                    </td>
                  </tr>
                ) : clients.map(c => (
                  <tr
                    key={c._id}
                    onClick={() => openView(c)}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${!c.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 text-xs">{c.pan || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.businessName || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.isActive ? 'compliant' : 'overdue'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <button onClick={e => { e.stopPropagation(); openView(c); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <FaEye />
                        </button>
                        {/* Edit */}
                        <button onClick={e => openEdit(c, e)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                          <FaEdit />
                        </button>
                        {/* Toggle active */}
                        <button onClick={e => toggleActive(c, e)}
                          className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={c.isActive ? 'Deactivate' : 'Activate'}>
                          {c.isActive ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                        </button>
                        {/* Delete */}
                        <button onClick={e => openDelete(c, false, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Showing {clients.length} of {total} clients</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="px-3 py-1 font-medium">{page} / {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {editClient ? 'Edit Client' : 'Add New Client'}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {editClient ? 'Update client information' : 'Create a new client account'}
                </p>
              </div>
              <button onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" className={`${inputClass} pl-8`} placeholder="e.g. Rajesh Kumar"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="email" className={`${inputClass} pl-8`} placeholder="email@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    required disabled={!!editClient} />
                </div>
                {editClient && <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>}
              </div>

              {/* Password (only on add) */}
              {!editClient && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Password *
                  </label>
                  <input type="password" className={inputClass} placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="tel" className={`${inputClass} pl-8`} placeholder="+91 98765 43210"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>

                {/* PAN */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PAN Number</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      className={`${inputClass} pl-8 font-mono ${form.pan && !PAN_REGEX.test(form.pan) ? 'border-red-400' : form.pan && PAN_REGEX.test(form.pan) ? 'border-green-400' : ''}`}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={form.pan}
                      onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    />
                  </div>
                  {form.pan && !PAN_REGEX.test(form.pan) && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {10 - form.pan.length > 0 ? `${10 - form.pan.length} more char(s)` : 'Invalid format'}
                    </p>
                  )}
                  {form.pan && PAN_REGEX.test(form.pan) && (
                    <p className="text-xs text-green-600 mt-0.5">✓ Valid PAN</p>
                  )}
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Business Name</label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" className={`${inputClass} pl-8`} placeholder="Acme Pvt Ltd"
                    value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 text-xs" />
                  <textarea className={`${inputClass} pl-8`} placeholder="Full address" rows={2}
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  {saving ? 'Saving...' : editClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CLIENT DETAIL VIEW MODAL
      ══════════════════════════════════════ */}
      {showDetailModal && viewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-lg">
                    {viewClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{viewClient.name}</h3>
                    <p className="text-blue-200 text-sm">{viewClient.businessName || 'Individual'}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)}
                  className="p-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors">
                  <FaTimes className="text-white" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-3">
              {[
                { icon: <FaEnvelope />, label: 'Email', value: viewClient.email },
                { icon: <FaPhone />, label: 'Phone', value: viewClient.phone || '—' },
                { icon: <FaIdCard />, label: 'PAN Number', value: viewClient.pan || '—', mono: true },
                { icon: <FaBuilding />, label: 'Business', value: viewClient.businessName || '—' },
                { icon: <FaMapMarkerAlt />, label: 'Address', value: viewClient.address || '—' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3 py-2 border-b border-gray-50">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">{row.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{row.label}</p>
                    <p className={`text-sm font-medium text-gray-900 ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 py-2">
                <span className="text-blue-500 flex-shrink-0"><FaToggleOn /></span>
                <div>
                  <p className="text-xs text-gray-400">Account Status</p>
                  <StatusBadge status={viewClient.isActive ? 'compliant' : 'overdue'} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => { setShowDetailModal(false); openEdit(viewClient, { stopPropagation: () => { } }); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                <FaEdit /> Edit
              </button>
              <button onClick={e => { setShowDetailModal(false); openDelete(viewClient, false, { stopPropagation: () => { } }); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
                <FaTrash /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════ */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Remove Client</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              You are about to remove <strong>{deleteTarget.name}</strong>.
            </p>

            {/* Hard vs soft delete toggle */}
            <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="deleteType" checked={!deleteHard}
                  onChange={() => setDeleteHard(false)} className="accent-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deactivate (Recommended)</p>
                  <p className="text-xs text-gray-400">Hides the client but keeps all records</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="deleteType" checked={deleteHard}
                  onChange={() => setDeleteHard(true)} className="accent-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-700">Permanently Delete</p>
                  <p className="text-xs text-gray-400">Removes client account forever</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Removing...' : deleteHard ? 'Delete Forever' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
