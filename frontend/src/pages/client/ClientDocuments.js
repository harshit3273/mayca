import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FaUpload, FaDownload, FaFilePdf, FaFileImage,
  FaFileExcel, FaFile, FaSpinner, FaTrash
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

// ── helpers ──────────────────────────────────────────────────
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

// Authenticated download — uses JWT token via API instance
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

// ── component ─────────────────────────────────────────────────
const ClientDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [gst, setGst] = useState([]);
  const [itr, setItr] = useState([]);
  const [payments, setPayments] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([
      API.get('/documents').then(r => setDocuments(r.data)),
      API.get('/gst').then(r => setGst(r.data)),
      API.get('/itr').then(r => setItr(r.data)),
      API.get('/payments').then(r => setPayments(r.data)),
    ]).catch(() => { }).finally(() => setLoading(false));
  }, []);

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Only PDF, JPG, PNG, and XLSX files are allowed');
      fileRef.current.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      fileRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'general');

    setUploading(true);
    try {
      const { data } = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [data, ...prev]);
      toast.success(`"${file.name}" uploaded successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  // ── Authenticated download ────────────────────────────────
  const handleDownload = async (doc) => {
    setDownloadingId(doc._id);
    await downloadFile(doc._id, doc.originalName);
    setDownloadingId(null);
  };

  // ── PDF Compliance Report ─────────────────────────────────
  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Compliance Summary Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Client: ${user.name}`, 14, 32);
    doc.text(`PAN: ${user.pan || 'N/A'}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 44);

    let y = 54;

    // GST
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text('GST Returns', 14, y);
    doc.autoTable({
      startY: y + 4,
      head: [['Return Type', 'Period', 'Status', 'Next Due Date']],
      body: gst.length > 0
        ? gst.map(r => [
          r.returnType,
          r.filingPeriod || '—',
          r.status.toUpperCase(),
          r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString('en-IN') : '—'
        ])
        : [['No GST records', '', '', '']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    });

    y = doc.lastAutoTable.finalY + 12;
    if (y > 250) { doc.addPage(); y = 20; }

    // ITR
    doc.setFontSize(13);
    doc.setTextColor(124, 58, 237);
    doc.text('ITR Filings', 14, y);
    doc.autoTable({
      startY: y + 4,
      head: [['ITR Type', 'Assessment Year', 'Status', 'Refund Status', 'Refund Amount']],
      body: itr.length > 0
        ? itr.map(r => [
          r.itrType,
          r.assessmentYear || '—',
          r.status.toUpperCase(),
          r.refundStatus.replace('_', ' '),
          r.refundAmount > 0 ? `₹${Number(r.refundAmount).toLocaleString('en-IN')}` : '—'
        ])
        : [['No ITR records', '', '', '', '']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [124, 58, 237] },
      alternateRowStyles: { fillColor: [245, 243, 255] },
    });

    y = doc.lastAutoTable.finalY + 12;
    if (y > 250) { doc.addPage(); y = 20; }

    // Payments
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.text('Outstanding Payments', 14, y);
    const pendingPayments = payments.filter(p => p.status !== 'paid');
    doc.autoTable({
      startY: y + 4,
      head: [['Description', 'Amount (₹)', 'Due Date', 'Status']],
      body: pendingPayments.length > 0
        ? pendingPayments.map(p => [
          p.description,
          `₹${Number(p.amount).toLocaleString('en-IN')}`,
          p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '—',
          p.status.toUpperCase()
        ])
        : [['All payments cleared', '', '', '']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
      alternateRowStyles: { fillColor: [255, 241, 242] },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} — CA Firm Portal — Confidential`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`Compliance_Report_${user.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
    toast.success('Report downloaded successfully');
  };

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── Action cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Upload */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FaUpload />
            </div>
            <h3 className="font-semibold text-gray-900">Upload Document</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">PDF, JPG, PNG, XLSX · Max 10MB</p>
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png,.xlsx"
          />
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 w-full transition-colors"
          >
            {uploading
              ? <><FaSpinner className="animate-spin" /> Uploading...</>
              : <><FaUpload /> Choose File</>
            }
          </button>
        </div>

        {/* Download Report */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FaDownload />
            </div>
            <h3 className="font-semibold text-gray-900">Compliance Report</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Download full GST, ITR & payment summary as PDF</p>
          <button
            onClick={downloadReport}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 w-full transition-colors"
          >
            <FaDownload /> Download PDF Report
          </button>
        </div>
      </div>

      {/* ── Document list ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">My Documents</h3>
          <span className="text-xs text-gray-400">{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaFile className="mx-auto text-4xl mb-3 opacity-20" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs mt-1">Upload your first document above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {documents.map(d => (
              <div key={d._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex-shrink-0">{fileIcon(d.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.originalName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {new Date(d.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{formatSize(d.fileSize)}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono uppercase">
                      {d.fileType.replace('.', '')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(d)}
                  disabled={downloadingId === d._id}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-40"
                  title="Download"
                >
                  {downloadingId === d._id
                    ? <FaSpinner className="animate-spin text-sm" />
                    : <FaDownload className="text-sm" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;
