import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaCalendarCheck } from 'react-icons/fa';
import API from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ preferredDate: '', preferredTime: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    API.get('/appointments').then(r => setAppointments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const upcoming = appointments
    .filter(a => a.status === 'confirmed' && new Date(a.preferredDate) >= new Date())
    .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.preferredDate || !form.preferredTime) {
      toast.error('Date and time are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await API.post('/appointments', form);
      setAppointments(prev => [...prev, data]);
      toast.success('Appointment request sent to your CA!');
      setShowModal(false);
      setForm({ preferredDate: '', preferredTime: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  const appointmentDates = new Set(appointments.map(a => new Date(a.preferredDate).toDateString()));
  const tileContent = ({ date }) => {
    if (appointmentDates.has(date.toDateString())) {
      return <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-0.5" />;
    }
    return null;
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          <FaPlus /> Book Appointment
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Calendar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Calendar</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} />
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarCheck className="text-green-600" />
            <h3 className="font-semibold text-gray-900">Upcoming Confirmed</h3>
          </div>
          {loading ? <LoadingSpinner /> : upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No upcoming appointments</div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div key={a._id} className="p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{new Date(a.preferredDate).toDateString()}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{a.preferredTime} — {a.description || 'General Consultation'}</p>
                      {a.ca?.name && <p className="text-xs text-blue-600 mt-0.5">with {a.ca.name}</p>}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">All Appointments</h3>
        {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No appointments yet</div>
        ) : (
          <div className="space-y-2">
            {[...appointments].sort((a, b) => new Date(b.preferredDate) - new Date(a.preferredDate)).map(a => (
              <div key={a._id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{new Date(a.preferredDate).toDateString()} at {a.preferredTime}</p>
                  <p className="text-xs text-gray-400">{a.description || 'No description'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Book Appointment</h3>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Preferred Date *</label>
                <input type="date" className={inputClass} required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Preferred Time *</label>
                <input type="time" className={inputClass} required value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea className={inputClass} rows={3} placeholder="What would you like to discuss?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Booking...' : 'Request Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;
