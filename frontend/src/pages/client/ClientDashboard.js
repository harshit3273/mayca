import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  FaTachometerAlt, FaFileInvoiceDollar, FaRegFileAlt,
  FaUpload, FaDownload, FaComments, FaCalendarAlt,
  FaRupeeSign, FaUndo, FaBuilding, FaMoneyCheckAlt, FaBell
} from 'react-icons/fa';

import ClientOverview from './ClientOverview';
import ClientGST from './ClientGST';
import ClientITR from './ClientITR';
import ClientDocuments from './ClientDocuments';
import ClientChat from './ClientChat';
import ClientAppointments from './ClientAppointments';
import ClientTDS from './ClientTDS';
import ClientROC from './ClientROC';
import ClientPayments from './ClientPayments';
import ClientNotifications from './ClientNotifications';
import ProfilePage from '../../pages/ProfilePage';

const navItems = [
  { path: '/client', end: true, icon: <FaTachometerAlt />, label: 'Overview' },
  { path: '/client/gst', icon: <FaFileInvoiceDollar />, label: 'GST Status' },
  { path: '/client/itr', icon: <FaRegFileAlt />, label: 'ITR Status' },
  { path: '/client/tds', icon: <FaMoneyCheckAlt />, label: 'TDS Status' },
  { path: '/client/roc', icon: <FaBuilding />, label: 'ROC Compliance' },
  { path: '/client/payments', icon: <FaRupeeSign />, label: 'Payments' },
  { path: '/client/documents', icon: <FaUpload />, label: 'Documents' },
  { path: '/client/notifications', icon: <FaBell />, label: 'Notifications' },
  { path: '/client/chat', icon: <FaComments />, label: 'Chat with CA' },
  { path: '/client/appointments', icon: <FaCalendarAlt />, label: 'Appointments' },
];

const getTitle = (path) => {
  const map = {
    '/client': 'My Dashboard',
    '/client/gst': 'GST Status',
    '/client/itr': 'ITR Status',
    '/client/tds': 'TDS Status',
    '/client/roc': 'ROC Compliance',
    '/client/payments': 'Payments',
    '/client/documents': 'Documents',
    '/client/notifications': 'Notifications',
    '/client/chat': 'Chat with CA',
    '/client/appointments': 'Appointments',
  };
  return map[path] || 'Client Dashboard';
};

const ClientDashboard = () => {
  return (
    <Layout navItems={navItems} title="Client Dashboard">
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="gst" element={<ClientGST />} />
        <Route path="itr" element={<ClientITR />} />
        <Route path="tds" element={<ClientTDS />} />
        <Route path="roc" element={<ClientROC />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="chat" element={<ClientChat />} />
        <Route path="appointments" element={<ClientAppointments />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/client" />} />
      </Routes>
    </Layout>
  );
};

export default ClientDashboard;
