import React, { useEffect, useState } from 'react';
import {
  FaFileInvoiceDollar, FaRegFileAlt, FaRupeeSign, FaUndo,
  FaExclamationTriangle, FaCheckCircle, FaClock, FaCalendarAlt,
  FaComments, FaUpload
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
    <div className="h-6 w-24 bg-gray-200 rounded" />
  </div>
);

const ClientOverview = () => {
  const { user } = useAuth();
  const [gst, setGst] = useState([]);
  const [itr, setItr] = useState([]);
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/gst').then(r => setGst(r.data)),
      API.get('/itr').then(r => setItr(r.data)),
      API.get('/payments').then(r => setPayments(r.data)),
      API.get('/appointments').then(r => setAppointments(r.data)),
    ]).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const latestGST = gst[0];
  const latestITR = itr[0];
  const pendingPayments = payments.filter(p => p.status !== 'paid');
  const totalDue = pendingPayments.reduce((s, p) => s + p.amount, 0);
  const refundRecord = itr.find(i => i.refundStatus === 'pending' || i.refundStatus === 'processed');
  const upcomingAppts = appointments
    .filter(a => a.status === 'confirmed' && new Date(a.preferredDate) >= new Date())
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

  // Due date warnings
  const now = new Date();
  const daysUntil = (d) => Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24));
  const gstDays = latestGST?.nextDueDate ? daysUntil(latestGST.nextDueDate) : null;
  const itrDays = latestITR?.dueDate ? daysUntil(latestITR.dueDate) : null;

  const gstWarning = latestGST?.status === 'pending' && gstDays !== null && gstDays <= 7;
  const itrWarning = latestITR?.status === 'pending' && itrDays !== null && itrDays <= 15;
  const gstOverdue = latestGST?.status === 'overdue' || (gstDays !== null && gstDays < 0);
  const itrOverdue = latestITR?.status === 'overdue' || (itrDays !== null && itrDays < 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's your compliance summary</p>
        </div>
        {user?.assignedCA ? (
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Assigned CA</p>
            <p className="text-sm font-bold text-indigo-900">{user.assignedCA.name}</p>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
            <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">Status</p>
            <p className="text-sm font-bold text-orange-900">Awaiting CA Assignment</p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {(gstWarning || itrWarning || gstOverdue || itrOverdue) && (
        <div className="space-y-2">
          {(gstOverdue) && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">GST Return Overdue!</p>
                <p className="text-xs mt-0.5">Your GST return is overdue. Contact your CA immediately to avoid penalties.</p>
              </div>
            </div>
          )}
          {gstWarning && !gstOverdue && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3">
              <FaClock className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">GST Due in {gstDays} day{gstDays !== 1 ? 's' : ''}</p>
                <p className="text-xs mt-0.5">Due on {new Date(latestGST.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}
          {(itrOverdue) && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">ITR Filing Overdue!</p>
                <p className="text-xs mt-0.5">Your ITR is past due. Late filing attracts fees under Section 234F.</p>
              </div>
            </div>
          )}
          {itrWarning && !itrOverdue && (
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-3">
              <FaClock className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">ITR Due in {itrDays} day{itrDays !== 1 ? 's' : ''}</p>
                <p className="text-xs mt-0.5">Due on {new Date(latestITR.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : (
          <>
            {/* GST */}
            <Link to="/client/gst" className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <FaFileInvoiceDollar />
              </div>
              <p className="text-xs text-gray-500 font-medium">GST Status</p>
              {latestGST ? (
                <>
                  <p className="font-bold text-gray-900 mt-1">{latestGST.returnType}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={latestGST.status} />
                  </div>
                  {latestGST.nextDueDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Due: {new Date(latestGST.nextDueDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </>
              ) : <p className="text-sm text-gray-400 mt-1">No records</p>}
            </Link>

            {/* ITR */}
            <Link to="/client/itr" className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                <FaRegFileAlt />
              </div>
              <p className="text-xs text-gray-500 font-medium">ITR Status</p>
              {latestITR ? (
                <>
                  <p className="font-bold text-gray-900 mt-1">{latestITR.itrType}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={latestITR.status} />
                  </div>
                  {latestITR.assessmentYear && (
                    <p className="text-xs text-gray-400 mt-1">AY {latestITR.assessmentYear}</p>
                  )}
                </>
              ) : <p className="text-sm text-gray-400 mt-1">No records</p>}
            </Link>

            {/* Tax Due */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <FaRupeeSign />
              </div>
              <p className="text-xs text-gray-500 font-medium">Tax Due</p>
              <p className={`text-xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{totalDue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {pendingPayments.length > 0 ? `${pendingPayments.length} pending` : 'All clear ✓'}
              </p>
            </div>

            {/* Refund */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
                <FaUndo />
              </div>
              <p className="text-xs text-gray-500 font-medium">Refund Status</p>
              {refundRecord ? (
                <>
                  <div className="mt-1.5">
                    <StatusBadge status={refundRecord.refundStatus} />
                  </div>
                  {refundRecord.refundAmount > 0 && (
                    <p className="text-sm font-bold text-green-600 mt-1">
                      ₹{Number(refundRecord.refundAmount).toLocaleString('en-IN')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-400 mt-1">N/A</p>
                  <p className="text-xs text-gray-400 mt-0.5">No refund data</p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom section: payments + appointments + quick actions */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Pending Payments */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaRupeeSign className="text-red-500" /> Outstanding Payments
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <FaCheckCircle className="text-green-400 text-3xl mb-2" />
              <p className="text-sm font-medium text-green-600">All payments cleared!</p>
              <p className="text-xs text-gray-400 mt-1">No outstanding dues</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingPayments.map(p => (
                <div key={p._id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.description}</p>
                    {p.dueDate && <p className="text-xs text-gray-400 mt-0.5">Due: {new Date(p.dueDate).toLocaleDateString('en-IN')}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointment + quick actions */}
        <div className="space-y-4">
          {/* Next appointment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Next Appointment
            </h3>
            {upcomingAppts.length > 0 ? (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-blue-900">
                  {new Date(upcomingAppts[0].preferredDate).toDateString()}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {upcomingAppts[0].preferredTime} — {upcomingAppts[0].description || 'Consultation'}
                </p>
                {upcomingAppts[0].ca?.name && (
                  <p className="text-xs text-blue-500 mt-1">with {upcomingAppts[0].ca.name}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">No upcoming appointments</p>
                <Link to="/client/appointments" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Book one →
                </Link>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: <FaUpload />, label: 'Upload Document', link: '/client/documents', color: 'text-blue-600 bg-blue-50' },
                { icon: <FaComments />, label: 'Chat with CA', link: '/client/chat', color: 'text-purple-600 bg-purple-50' },
                { icon: <FaCalendarAlt />, label: 'Book Appointment', link: '/client/appointments', color: 'text-green-600 bg-green-50' },
              ].map(a => (
                <Link key={a.label} to={a.link}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${a.color}`}>
                    {a.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;
