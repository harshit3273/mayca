import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FaUpload, FaDownload, FaFilePdf, FaFileImage,
  FaFileExcel, FaFile, FaSpinner, FaSearch, FaTimes
} from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const fileIcon = (type) => {
  if (type === '.pdf') return <FaFilePdf className="text-red-500 text-xl" />;
  if (['.jpg', '.jpeg', '.png'].includes(type)) return <FaFileImage className="text-blue-500 text-xl" />;
  if (type === '.xlsx') return <FaFileExcel className="text-green-500 text-xl" />;
  return <FaFile className="text-gray-400 text-xl" />;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const downloadFile = async (docId, originalName) => {
  try {
    const response = await API.get(`/documents/download/${docId}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    toast.error('Failed to download file');
  }
};

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [selectedClient, setSelectedClient] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      API.get('/documents').then(r => setDocuments(r.data)),
      API.get('/clients?limit=200').then(r => setClients(r.data.clients))
    ]).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Please select a file');
    if (!selectedClient) return toast.error('Please select a client');

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      return toast.error('Only PDF, JPG, PNG, and XLSX files are allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size must be under 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', selectedClient);
    formData.append('category', category);
    formData.append('description', description);

    setUploading(true);
    try {
      const { data } = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [data, ...prev]);
      toast.success(`"${file.name}" uploaded successfully`);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc._id);
    await downloadFile(doc._id, doc.originalName);
    setDownloadingId(null);
  };

  const filtered = documents.filter(d => {
    const clientName = d.client?.name || '';
    const matchSearch = !search || clientName.toLowerCase().includes(search.toLowerCase()) || d.originalName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-sm w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input type="text" placeholder="Search by client or filename..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { setSelectedClient(''); setDescription(''); setCategory('general'); if(fileRef.current) fileRef.current.value = ''; setShowModal(true); }} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <FaUpload /> Upload Document
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
                  <th className="text-left px-4 py-3">Document</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Uploaded By</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400">
                    <FaFile className="mx-auto text-3xl mb-2 opacity-20" />
                    No documents found
                  </td></tr>
                ) : filtered.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.client?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{fileIcon(d.fileType)}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate" title={d.originalName}>{d.originalName}</p>
                          <p className="text-xs text-gray-500">{formatSize(d.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{d.category}</td>
                    <td className="px-4 py-3 text-gray-600">{d.uploadedBy?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDownload(d)} disabled={downloadingId === d._id}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40" title="Download">
                        {downloadingId === d._id ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {documents.length} documents
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg">Upload Document</h3>
                <p className="text-sm text-gray-400 mt-0.5">Share a document with a client</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FaTimes className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client *</label>
                <select className={inputClass} value={selectedClient} onChange={e => setSelectedClient(e.target.value)} required>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.pan ? ` (${c.pan})` : ''}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">General</option>
                  <option value="itr">ITR</option>
                  <option value="gst">GST</option>
                  <option value="roc">ROC</option>
                  <option value="kyc">KYC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">File * (PDF, Image, Excel - Max 10MB)</label>
                <input type="file" ref={fileRef} className={inputClass} accept=".pdf,.jpg,.jpeg,.png,.xlsx" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (Optional)</label>
                <input type="text" className={inputClass} placeholder="e.g. FY 23-24 Tax Computation" value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {uploading ? <><FaSpinner className="animate-spin" /> Uploading...</> : <><FaUpload /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
