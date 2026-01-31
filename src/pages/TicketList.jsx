import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTickets } from '../store/useStore';
import { filterTickets, formatDate } from '../utils/helpers';
import { STATUSES, PRIORITIES, CATEGORIES, LOCATIONS, ROLES } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const PRIORITY_BORDER = {
  Critical: 'border-l-4 border-l-red-500 bg-red-50/30',
  High: 'border-l-4 border-l-orange-400',
  Medium: 'border-l-4 border-l-blue-400',
  Low: 'border-l-4 border-l-gray-300',
};

export default function TicketList() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const allTickets = useMemo(() => getTickets(), [refreshKey]);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    location: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const tickets = useMemo(() => {
    let base = allTickets;
    if (user.role === ROLES.TEACHER) {
      base = base.filter((t) => t.submittedBy === user.username);
    }
    let filtered = filterTickets(base, filters);
    filtered.sort((a, b) => {
      let av = a[sortField] || '';
      let bv = b[sortField] || '';
      if (sortField === 'createdAt') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [allTickets, filters, sortField, sortDir, user]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function clearFilters() {
    setFilters({ status: '', category: '', priority: '', location: '', search: '', dateFrom: '', dateTo: '' });
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === ROLES.TEACHER ? 'My Tickets' : 'All Tickets'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition ${
              hasActiveFilters ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
          </button>
          <button
            onClick={() => { setRefreshKey((k) => k + 1); }}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 animate-fade-in">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Filter Tickets</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Statuses</option>
                {Object.values(STATUSES).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Priorities</option>
                {Object.values(PRIORITIES).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Categories</option>
                {Object.values(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                title="From date"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                title="To date"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No tickets found</p>
            <p className="text-gray-400 text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters.' : 'No tickets have been submitted yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    <button onClick={() => toggleSort('id')} className="flex items-center gap-1 hover:text-gray-900">
                      ID {sortField === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-900">
                      Date {sortField === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${PRIORITY_BORDER[ticket.priority] || ''}`}>
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${ticket.id}`} className="font-mono text-xs text-primary-600 hover:text-primary-700 font-medium">
                        {ticket.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{ticket.subcategory || ticket.category}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{ticket.location}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-xs bg-primary-50 px-2.5 py-1 rounded-md transition hover:bg-primary-100"
                      >
                        View
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
