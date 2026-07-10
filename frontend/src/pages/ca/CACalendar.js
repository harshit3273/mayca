import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaCalendarDay } from 'react-icons/fa';
import API from '../../utils/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CACalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client: '', preferredDate: '', preferredTime: '', description: '' });

  useEffect(() => {
    API.get('/appointments').then(r => setAppointments(r.data)).catch(() => {});
    API.get('/clients?limit=100').then(r => setClients(r.data.clients)).catch(() => {});
  }, []);

  const selectedDateStr = selectedDate.toDateString();
  const dayAppointments = appointments.filter(a =>
    new Date(a.preferredDate).toDateString() === selectedDateStr
  );

  const appointmentDates = new Set(appointments.map(a => new Date(a.preferredDate).toDateString()));

  const tileContent = ({ date }) => {
    if (appointmentDates.has(date.toDateString())) {
      return <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-0.5" />;
    }
    return null;
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await API.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? data : a));
      toast.success(`Appointment ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
            <FaPlus /> Add
          </button>
        </div>
        <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} />
      </div>

      {/* Day events */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarDay className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">{selectedDate.toDateString()}</h3>
        </div>
        {dayAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No appointments on this day</div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map(a => (
              <div key={a._id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.client?.name || 'Client'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.preferredTime} — {a.description || 'No description'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleStatusUpdate(a._id, 'confirmed')}
                      className="flex-1 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Confirm</button>
                    <button onClick={() => handleStatusUpdate(a._id, 'declined')}
                      className="flex-1 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add appointment modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Schedule Appointment</h3>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { data } = await API.post('/appointments', form);
                setAppointments(prev => [...prev, data]);
                toast.success('Appointment scheduled');
                setShowModal(false);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed');
              }
            }} className="space-y-3">
              <select className={inputClass} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required>
                <option value="">Select Client *</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <div><label className="text-xs text-gray-500">Date *</label>
                <input type="date" className={inputClass} required value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} /></div>
              <input type="time" className={inputClass} required value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })} />
              <textarea placeholder="Description" className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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

export default CACalendar;
