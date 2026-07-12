import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import { FaUserPlus, FaLink, FaSignOutAlt, FaUserShield, FaUsers, FaUserTie, FaMoneyBillWave, FaTasks, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [unassignedClients, setUnassignedClients] = useState([]);
  const [cas, setCas] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [stats, setStats] = useState({ totalCAs: 0, totalClients: 0, pendingGST: 0, pendingITR: 0, outstandingRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCAForm, setShowCAForm] = useState(false);
  const [caForm, setCaForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [creatingCA, setCreatingCA] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCA, setExpandedCA] = useState(null);

  const fetchData = async () => {
    try {
      const [clientsRes, casRes, statsRes, allClientsRes] = await Promise.all([
        API.get('/admin/unassigned-clients'),
        API.get('/admin/cas-workload'),
        API.get('/admin/dashboard-stats'),
        API.get('/admin/all-clients')
      ]);
      setUnassignedClients(clientsRes.data);
      setCas(casRes.data);
      setStats(statsRes.data);
      setAllClients(allClientsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (clientId, caId) => {
    if (!caId) return toast.error('Please select a CA');
    try {
      await API.put(`/admin/assign-client/${clientId}`, { caId });
      toast.success(caId === 'unassigned' ? 'Client unassigned successfully' : 'Client assigned successfully');
      fetchData(); // Refresh all tables
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleCreateCA = async (e) => {
    e.preventDefault();
    setCreatingCA(true);
    try {
      await API.post('/admin/ca', caForm);
      toast.success('CA account created successfully');
      setCaForm({ name: '', email: '', password: '', phone: '' });
      setShowCAForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create CA');
    } finally {
      setCreatingCA(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await API.put(`/admin/toggle-user/${userId}`);
      toast.success('User status toggled');
      fetchData();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-md">
                <FaUserShield className="text-white text-lg" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Admin<span className="text-gray-400">Portal</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full hidden sm:block">
                Super Admin: {user.name}
              </span>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm">
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ── Top Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl"><FaUsers/></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Clients</p><p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl"><FaUserTie/></div>
            <div><p className="text-sm text-gray-500 font-medium">Active CAs</p><p className="text-2xl font-bold text-gray-900">{stats.totalCAs}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl"><FaTasks/></div>
            <div><p className="text-sm text-gray-500 font-medium">Pending Filings</p><p className="text-2xl font-bold text-gray-900">{stats.pendingGST + stats.pendingITR}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl"><FaMoneyBillWave/></div>
            <div><p className="text-sm text-gray-500 font-medium">Outstanding Rev</p><p className="text-2xl font-bold text-gray-900">₹{stats.outstandingRevenue}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left Column (CA Workload & Unassigned) ── */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Unassigned Clients (Action Required) */}
            {unassignedClients.length > 0 && (
              <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="px-5 py-4 border-b border-red-100">
                  <h3 className="font-bold text-red-900">Action Required</h3>
                  <p className="text-xs text-red-700">{unassignedClients.length} clients need assignment</p>
                </div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {unassignedClients.map(client => (
                    <div key={client._id} className="bg-white p-3 rounded-xl shadow-sm border border-red-100">
                      <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{client.email}</p>
                      <div className="flex gap-2">
                        <select id={`select-unassigned-${client._id}`} defaultValue="unassigned" className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-red-400">
                          <option value="unassigned" disabled>Assign to...</option>
                          {cas.map(ca => <option key={ca._id} value={ca._id} disabled={ca.isActive === false}>{ca.name} {ca.isActive === false ? '(Disabled)' : ''}</option>)}
                        </select>
                        <button onClick={() => handleAssign(client._id, document.getElementById(`select-unassigned-${client._id}`).value)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CA Workload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">CA Workload</h3>
                <button onClick={() => setShowCAForm(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                  <FaUserPlus /> New CA
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {cas.map(ca => (
                  <div key={ca._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${ca.isActive === false ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{ca.name}</p>
                        {ca.isActive === false && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Disabled</span>}
                      </div>
                      <p className="text-xs text-gray-500">{ca.email}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs font-medium text-indigo-600 cursor-pointer hover:underline" onClick={() => setExpandedCA(expandedCA === ca._id ? null : ca._id)}>
                          Managing {ca.clientCount || 0} clients
                        </p>
                        <p className="text-xs font-medium text-emerald-600">Completed {ca.completedWork || 0} filings</p>
                      </div>
                      {expandedCA === ca._id && (
                        <div className="mt-2 pl-2 border-l-2 border-indigo-100 space-y-1">
                          {allClients.filter(c => c.assignedCA?._id === ca._id).map(c => (
                            <div key={c._id} className="text-xs text-gray-600 flex justify-between pr-2">
                              <span>{c.name}</span>
                              <span className={c.isActive !== false ? 'text-green-600' : 'text-red-500'}>{c.isActive !== false ? 'Active' : 'Suspended'}</span>
                            </div>
                          ))}
                          {allClients.filter(c => c.assignedCA?._id === ca._id).length === 0 && (
                            <p className="text-xs text-gray-400 italic">No clients assigned</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleUserStatus(ca._id)} className={`p-2 rounded-lg transition-colors ${ca.isActive !== false ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={ca.isActive !== false ? "Deactivate CA" : "Reactivate CA"}>
                      {ca.isActive !== false ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* ── Right Column (Master Client Directory) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Master Client Directory</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Manage and reassign all clients across the firm</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {allClients.length} Total
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Client</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Assigned CA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allClients
                      .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(client => (
                      <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className={`font-semibold ${client.isActive === false ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleUserStatus(client._id)} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${client.isActive !== false ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {client.isActive !== false ? 'Active' : 'Suspended'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select 
                              id={`select-reassign-${client._id}`}
                              defaultValue={client.assignedCA?._id || "unassigned"}
                              className="w-40 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                              onChange={(e) => {
                                if(e.target.value !== (client.assignedCA?._id || "unassigned")) {
                                  handleAssign(client._id, e.target.value);
                                }
                              }}
                            >
                              <option value="unassigned">Unassigned</option>
                              {cas.map(ca => <option key={ca._id} value={ca._id} disabled={ca.isActive === false}>{ca.name} {ca.isActive === false ? '(Disabled)' : ''}</option>)}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allClients.filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <tr><td colSpan="3" className="text-center py-12 text-gray-400">No clients in the system yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CA Creation Modal */}
      {showCAForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-gray-900">Provision CA Account</h3>
              <button onClick={() => setShowCAForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleCreateCA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors" value={caForm.name} onChange={e => setCaForm({...caForm, name: e.target.value})} placeholder="e.g. John Doe, CA" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                <input required type="email" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors" value={caForm.email} onChange={e => setCaForm({...caForm, email: e.target.value})} placeholder="ca@firm.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Temporary Password</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors" value={caForm.password} onChange={e => setCaForm({...caForm, password: e.target.value})} placeholder="Secure password" />
              </div>
              <button type="submit" disabled={creatingCA} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold mt-4 transition-colors">
                {creatingCA ? 'Creating...' : 'Create CA Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
