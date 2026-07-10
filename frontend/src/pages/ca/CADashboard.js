import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  FaTachometerAlt, FaUsers, FaFileInvoiceDollar, FaRegFileAlt,
  FaMoneyCheckAlt, FaBuilding, FaBell, FaRobot, FaCalendarAlt, FaComments, FaCalculator
} from 'react-icons/fa';

import CAOverview from './CAOverview';
import ClientList from './ClientList';
import GSTManagement from './GSTManagement';
import ITRManagement from './ITRManagement';
import TDSManagement from './TDSManagement';
import ROCManagement from './ROCManagement';
import CANotifications from './CANotifications';
import AIAssistant from './AIAssistant';
import CACalendar from './CACalendar';
import CAMessages from './CAMessages';
import PaymentManagement from './PaymentManagement';
import DocumentManagement from './DocumentManagement';
import CACalculator from './CACalculator';
import ProfilePage from '../../pages/ProfilePage';

const navItems = [
  { path: '/ca', end: true, icon: <FaTachometerAlt />, label: 'Overview' },
  { path: '/ca/clients', icon: <FaUsers />, label: 'Clients' },
  { path: '/ca/gst', icon: <FaFileInvoiceDollar />, label: 'GST Returns' },
  { path: '/ca/itr', icon: <FaRegFileAlt />, label: 'ITR Filing' },
  { path: '/ca/tds', icon: <FaMoneyCheckAlt />, label: 'TDS' },
  { path: '/ca/roc', icon: <FaBuilding />, label: 'ROC Compliance' },
  { path: '/ca/payments', icon: <FaMoneyCheckAlt />, label: 'Payments' },
  { path: '/ca/documents', icon: <FaRegFileAlt />, label: 'Documents' },
  { path: '/ca/notifications', icon: <FaBell />, label: 'Notifications' },
  { path: '/ca/messages', icon: <FaComments />, label: 'Messages' },
  { path: '/ca/calendar', icon: <FaCalendarAlt />, label: 'Calendar' },
  { path: '/ca/ai', icon: <FaRobot />, label: 'AI Assistant' },
  { path: '/ca/calculator', icon: <FaCalculator />, label: 'Tax Calculator' },
];

const getTitle = (path) => {
  const map = {
    '/ca': 'Dashboard Overview',
    '/ca/clients': 'Client Management',
    '/ca/gst': 'GST Returns',
    '/ca/itr': 'ITR Filing',
    '/ca/tds': 'TDS Management',
    '/ca/roc': 'ROC Compliance',
    '/ca/payments': 'Payments',
    '/ca/documents': 'Document Center',
    '/ca/notifications': 'Notifications',
    '/ca/messages': 'Messages',
    '/ca/calendar': 'Calendar',
    '/ca/ai': 'AI Assistant',
    '/ca/calculator': 'Tax Calculator',
  };
  return map[path] || 'CA Dashboard';
};

const CADashboard = () => {
  return (
    <Layout navItems={navItems} title="CA Dashboard">
      <Routes>
        <Route index element={<CAOverview />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="gst" element={<GSTManagement />} />
        <Route path="itr" element={<ITRManagement />} />
        <Route path="tds" element={<TDSManagement />} />
        <Route path="roc" element={<ROCManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="notifications" element={<CANotifications />} />
        <Route path="messages" element={<CAMessages />} />
        <Route path="calendar" element={<CACalendar />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="calculator" element={<CACalculator />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/ca" />} />
      </Routes>
    </Layout>
  );
};

export default CADashboard;
