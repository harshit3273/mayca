import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import {
  FaUsers, FaFileInvoiceDollar, FaRegFileAlt, FaMoneyCheckAlt,
  FaBuilding, FaRupeeSign, FaFileAlt, FaBell, FaSync,
  FaArrowUp, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded" />
        <div className="h-2 w-20 bg-gray-100 rounded" />
      </div>
      <div className="w-11 h-11 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const MetricCard = ({ title, value, icon, color, subtitle, link, trend }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  const card = (
    <div className={`bg-white rounded-2xl p-5 border ${c.border} hover:shadow-md transition-shadow group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 ${c.bg} ${c.text} rounded-xl flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            <FaArrowUp className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return link ? <Link to={link} className="block">{card}</Link> : card;
};

const CAOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await API.get('/dashboard/ca-summary');
      setData(res.data);
      setError('');
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatINR = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Number(n).toLocaleString('en-IN')}`;
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <FaExclamationCircle className="text-red-400 text-4xl mb-3" />
      <p className="text-gray-600 font-medium">{error}</p>
      <button onClick={() => fetchData()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
        Retry
      </button>
    </div>
  );

  // Build bar chart
  const monthlyData = Array(12).fill(0);
  if (data?.monthlyGST) data.monthlyGST.forEach(item => { monthlyData[item._id - 1] = item.count; });

  const barData = {
    labels: MONTHS,
    datasets: [{
      label: 'GST Returns Filed',
      data: monthlyData,
      backgroundColor: monthlyData.map(v => v > 0 ? '#3b82f6' : '#e5e7eb'),
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  // Build doughnut chart
  const statusColors = { filed: '#22c55e', pending: '#f59e0b', overdue: '#ef4444' };
  const pieLabels = (data?.complianceStats || []).map(s => s._id);
  const pieValues = (data?.complianceStats || []).map(s => s.count);
  const pieColors = pieLabels.map(l => statusColors[l] || '#94a3b8');

  const doughnutData = {
    labels: pieLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [{ data: pieValues, backgroundColor: pieColors, borderWidth: 0, hoverOffset: 6 }]
  };

  return (
    <div className="space-y-6">
      {/* Welcome + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's your firm's compliance overview</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <FaSync className={refreshing ? 'animate-spin text-blue-500' : 'text-gray-400'} />
          Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard title="Total Clients" value={data.totalClients} icon={<FaUsers />} color="blue" link="/ca/clients" subtitle="Active clients" />
            <MetricCard title="Pending GST" value={data.pendingGST} icon={<FaFileInvoiceDollar />} color="yellow" link="/ca/gst" subtitle="Returns due" />
            <MetricCard title="Pending ITR" value={data.pendingITR} icon={<FaRegFileAlt />} color="purple" link="/ca/itr" subtitle="Filings pending" />
            <MetricCard title="TDS Due (30d)" value={data.tdsDue} icon={<FaMoneyCheckAlt />} color="red" link="/ca/tds" subtitle="Within 30 days" />
            <MetricCard title="Pending ROC" value={data.pendingROC} icon={<FaBuilding />} color="indigo" link="/ca/roc" />
            <MetricCard title="Outstanding" value={formatINR(data.outstandingPayments)} icon={<FaRupeeSign />} color="red" link="/ca/payments" subtitle="Total dues" />
            <MetricCard title="Doc Requests" value={data.docRequests} icon={<FaFileAlt />} color="green" />
            <MetricCard title="Notifications" value="View All" icon={<FaBell />} color="yellow" link="/ca/notifications" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Monthly GST Filing Rate</h3>
              <p className="text-xs text-gray-400 mt-0.5">Current financial year</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-500">Filed</span>
            </div>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} returns filed` } } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
              }
            }} />
          )}
        </div>

        {/* Doughnut chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900">Compliance Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">GST return distribution</p>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : pieValues.length > 0 ? (
            <>
              <Doughnut data={doughnutData} options={{
                plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
                cutout: '65%',
              }} />
              <div className="mt-4 space-y-2">
                {pieLabels.map((label, i) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                      <span className="text-gray-600 capitalize">{label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{pieValues[i]}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
              <FaCheckCircle className="text-3xl mb-2 opacity-30" />
              <p>No data yet</p>
              <p className="text-xs mt-1">Add GST records to see chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Client', link: '/ca/clients', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Add GST Record', link: '/ca/gst', color: 'bg-green-600 hover:bg-green-700' },
            { label: 'Add ITR Record', link: '/ca/itr', color: 'bg-purple-600 hover:bg-purple-700' },
            { label: 'View Calendar', link: '/ca/calendar', color: 'bg-indigo-600 hover:bg-indigo-700' },
          ].map(a => (
            <Link key={a.label} to={a.link}
              className={`${a.color} text-white text-sm font-medium py-2.5 px-4 rounded-xl text-center transition-colors`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CAOverview;
