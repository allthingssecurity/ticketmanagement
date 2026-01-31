import { useState, useMemo } from 'react';
import { getTickets } from '../store/useStore';
import { filterTickets, daysBetween, exportToCSV } from '../utils/helpers';
import { STATUSES, PRIORITIES, STATUS_COLORS, CATEGORIES } from '../utils/constants';
import StatCard from '../components/StatCard';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line, Legend,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#22c55e', '#6b7280', '#ef4444'];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#22c55e', '#6b7280', '#ef4444'];

const CHART_HEADERS = [
  { title: 'Tickets by Status', gradient: 'from-blue-500 to-indigo-600', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  )},
  { title: 'Tickets Over Time', gradient: 'from-green-500 to-emerald-600', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )},
  { title: 'Hardware vs Software', gradient: 'from-purple-500 to-violet-600', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )},
  { title: 'Top Locations', gradient: 'from-amber-500 to-yellow-500', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
  { title: 'Tickets by Priority', gradient: 'from-red-500 to-orange-500', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )},
  { title: 'Resolution Time (days)', gradient: 'from-teal-500 to-cyan-500', icon: (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
];

function ChartHeader({ index }) {
  const h = CHART_HEADERS[index];
  return (
    <div className={`flex items-center gap-2 mb-4 -mx-5 -mt-5 px-5 py-3 rounded-t-xl bg-gradient-to-r ${h.gradient}`}>
      {h.icon}
      <h3 className="text-sm font-semibold text-white">{h.title}</h3>
    </div>
  );
}

export default function Analytics() {
  const allTickets = useMemo(() => getTickets(), []);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const tickets = useMemo(() => {
    return filterTickets(allTickets, { dateFrom, dateTo });
  }, [allTickets, dateFrom, dateTo]);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) =>
    [STATUSES.NEW, STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.ON_HOLD, STATUSES.REOPENED].includes(t.status)
  ).length;
  const resolvedTickets = tickets.filter((t) =>
    [STATUSES.RESOLVED, STATUSES.CLOSED].includes(t.status)
  ).length;

  const avgResolutionDays = useMemo(() => {
    const resolved = tickets.filter((t) => t.resolvedAt && t.createdAt);
    if (resolved.length === 0) return '—';
    const total = resolved.reduce((sum, t) => sum + daysBetween(t.createdAt, t.resolvedAt), 0);
    return (total / resolved.length).toFixed(1);
  }, [tickets]);

  const statusData = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const timeData = useMemo(() => {
    const byDate = {};
    tickets.forEach((t) => {
      const date = t.createdAt?.slice(0, 10);
      if (date) byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [tickets]);

  const categoryData = useMemo(() => {
    const hw = tickets.filter((t) => t.category === CATEGORIES.HARDWARE).length;
    const sw = tickets.filter((t) => t.category === CATEGORIES.SOFTWARE).length;
    return [
      { name: 'Hardware', count: hw },
      { name: 'Software', count: sw },
    ];
  }, [tickets]);

  const locationData = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => { if (t.location) counts[t.location] = (counts[t.location] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 12) + '...' : name, count, fullName: name }));
  }, [tickets]);

  const priorityData = useMemo(() => {
    return Object.values(PRIORITIES).map((p) => ({
      name: p,
      count: tickets.filter((t) => t.priority === p).length,
    }));
  }, [tickets]);

  const resolutionTrend = useMemo(() => {
    const resolved = tickets
      .filter((t) => t.resolvedAt && t.createdAt)
      .sort((a, b) => a.resolvedAt.localeCompare(b.resolvedAt));
    return resolved.map((t) => ({
      date: t.resolvedAt.slice(5, 10),
      days: daysBetween(t.createdAt, t.resolvedAt),
      id: t.id,
    }));
  }, [tickets]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="mt-0.5">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of ticket metrics and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-1 py-1 text-sm border-0 outline-none bg-transparent"
              title="From"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-1 py-1 text-sm border-0 outline-none bg-transparent"
              title="To"
            />
          </div>
          <button
            onClick={() => exportToCSV(tickets)}
            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-sm font-medium text-white hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-slide-up stagger-1">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            color="primary"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </div>
        <div className="animate-slide-up stagger-2">
          <StatCard
            title="Open"
            value={openTickets}
            color="warning"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
        <div className="animate-slide-up stagger-3">
          <StatCard
            title="Resolved"
            value={resolvedTickets}
            color="success"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
        <div className="animate-slide-up stagger-4">
          <StatCard
            title="Avg Resolution"
            value={avgResolutionDays === '—' ? '—' : `${avgResolutionDays}d`}
            color="purple"
            subtitle="days to resolve"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tickets by Status (donut) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={0} />
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tickets over Time (area) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={1} />
          {timeData.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Tickets" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hardware vs Software (bar) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={2} />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Location (bar) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={3} />
          {locationData.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tickets" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tickets by Priority (bar) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={4} />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                <Cell fill="#6b7280" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f97316" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time Trend (line) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden">
          <ChartHeader index={5} />
          {resolutionTrend.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-8">No resolved tickets</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={resolutionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="days" name="Days" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
