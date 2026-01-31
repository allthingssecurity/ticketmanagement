import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTickets } from '../store/useStore';
import { STATUSES, PRIORITIES, ROLES } from '../utils/constants';
import { formatDate, daysBetween } from '../utils/helpers';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const tickets = useMemo(() => getTickets(), []);

  const myTickets = user.role === ROLES.TEACHER
    ? tickets.filter((t) => t.submittedBy === user.username)
    : tickets;

  const openStatuses = [STATUSES.NEW, STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.ON_HOLD, STATUSES.REOPENED];
  const openTickets = myTickets.filter((t) => openStatuses.includes(t.status));
  const resolvedTickets = myTickets.filter((t) => [STATUSES.RESOLVED, STATUSES.CLOSED].includes(t.status));
  const criticalTickets = myTickets.filter((t) => t.priority === PRIORITIES.CRITICAL && openStatuses.includes(t.status));
  const newTickets = myTickets.filter((t) => t.status === STATUSES.NEW);

  const avgResolution = useMemo(() => {
    const resolved = myTickets.filter((t) => t.resolvedAt && t.createdAt);
    if (!resolved.length) return '—';
    const total = resolved.reduce((s, t) => s + daysBetween(t.createdAt, t.resolvedAt), 0);
    return (total / resolved.length).toFixed(1) + 'd';
  }, [myTickets]);

  const recentTickets = [...myTickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const roleGreeting = {
    [ROLES.ADMIN]: 'IT Admin Dashboard',
    [ROLES.TEACHER]: 'My Dashboard',
    [ROLES.PRINCIPAL]: 'School IT Overview',
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{roleGreeting[user.role]}</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={user.role === ROLES.TEACHER ? 'My Tickets' : 'Total Tickets'}
          value={myTickets.length}
          color="primary"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          title="Open"
          value={openTickets.length}
          color="warning"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Resolved"
          value={resolvedTickets.length}
          color="success"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        {user.role === ROLES.ADMIN ? (
          <StatCard
            title="New (Unassigned)"
            value={newTickets.length}
            color="danger"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
          />
        ) : (
          <StatCard
            title="Avg Resolution"
            value={avgResolution}
            color="purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tickets */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Tickets</h3>
            <Link to="/tickets" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No tickets yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTickets.map((t) => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.subcategory || t.category}</p>
                    <p className="text-xs text-gray-500 truncate">{t.id} &middot; {t.location}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Critical / High priority */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              {user.role === ROLES.ADMIN ? 'Needs Attention' : 'High Priority'}
            </h3>
          </div>
          {(() => {
            const urgent = myTickets
              .filter((t) => openStatuses.includes(t.status) && [PRIORITIES.HIGH, PRIORITIES.CRITICAL].includes(t.priority))
              .sort((a, b) => {
                const pri = { Critical: 0, High: 1 };
                return (pri[a.priority] ?? 2) - (pri[b.priority] ?? 2);
              })
              .slice(0, 5);

            if (urgent.length === 0) {
              return (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">No urgent tickets</p>
                </div>
              );
            }

            return (
              <div className="divide-y divide-gray-50">
                {urgent.map((t) => (
                  <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.subcategory || t.category}</p>
                      <p className="text-xs text-gray-500 truncate">{t.id} &middot; {formatDate(t.createdAt)}</p>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
