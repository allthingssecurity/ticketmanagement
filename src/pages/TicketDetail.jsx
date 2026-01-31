import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTicketById, updateTicket, getUsers } from '../store/useStore';
import { formatDateTime } from '../utils/helpers';
import { STATUS_FLOW, STATUSES, ROLES, STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TicketTimeline from '../components/TicketTimeline';

const STATUS_BTN_COLORS = {
  [STATUSES.ASSIGNED]: 'bg-purple-600 hover:bg-purple-700 text-white',
  [STATUSES.IN_PROGRESS]: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  [STATUSES.ON_HOLD]: 'bg-orange-500 hover:bg-orange-600 text-white',
  [STATUSES.RESOLVED]: 'bg-green-600 hover:bg-green-700 text-white',
  [STATUSES.CLOSED]: 'bg-gray-600 hover:bg-gray-700 text-white',
};

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const ticket = useMemo(() => getTicketById(id), [id, refreshKey]);
  const users = useMemo(() => getUsers(), []);
  const admins = users.filter((u) => u.role === ROLES.ADMIN);

  const [comment, setComment] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [assignTo, setAssignTo] = useState('');

  if (!ticket) {
    return (
      <div className="animate-fade-in text-center py-16">
        <p className="text-gray-500 font-medium">Ticket not found</p>
        <Link to="/tickets" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
          Back to tickets
        </Link>
      </div>
    );
  }

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = ticket.submittedBy === user.username;
  const allowedTransitions = STATUS_FLOW[ticket.status] || [];

  const canReopen = isOwner && ticket.status === STATUSES.RESOLVED;
  const canClose = isOwner && ticket.status === STATUSES.RESOLVED;

  const priorityColors = PRIORITY_COLORS[ticket.priority] || {};
  const priorityGradient = ticket.priority === 'Critical' ? 'from-red-500 to-red-600'
    : ticket.priority === 'High' ? 'from-orange-400 to-orange-500'
    : ticket.priority === 'Medium' ? 'from-blue-400 to-blue-500'
    : 'from-gray-400 to-gray-500';

  function changeStatus(newStatus) {
    const now = new Date().toISOString();
    const history = [...(ticket.history || [])];
    history.push({
      action: `Status changed to ${newStatus}`,
      by: user.username,
      at: now,
      note: statusNote || `Status updated to ${newStatus}`,
    });

    const updates = { status: newStatus, history };
    if (newStatus === STATUSES.RESOLVED) {
      updates.resolvedAt = now;
    }
    if (newStatus === STATUSES.CLOSED) {
      updates.closedAt = now;
    }

    updateTicket(ticket.id, updates);
    setStatusNote('');
    setRefreshKey((k) => k + 1);
  }

  function handleReopen() {
    const now = new Date().toISOString();
    const history = [...(ticket.history || [])];
    history.push({
      action: 'Status changed to Reopened',
      by: user.username,
      at: now,
      note: statusNote || 'Ticket reopened',
    });
    updateTicket(ticket.id, { status: STATUSES.REOPENED, history, resolvedAt: null });
    setStatusNote('');
    setRefreshKey((k) => k + 1);
  }

  function handleAssign() {
    if (!assignTo) return;
    const now = new Date().toISOString();
    const history = [...(ticket.history || [])];
    const assignedUser = users.find((u) => u.username === assignTo);
    history.push({
      action: 'Status changed to Assigned',
      by: user.username,
      at: now,
      note: `Assigned to ${assignedUser ? assignedUser.name : assignTo}`,
    });
    updateTicket(ticket.id, { status: STATUSES.ASSIGNED, assignedTo: assignTo, history });
    setAssignTo('');
    setRefreshKey((k) => k + 1);
  }

  function addComment() {
    if (!comment.trim()) return;
    const now = new Date().toISOString();
    const comments = [...(ticket.comments || [])];
    comments.push({ by: user.username, at: now, text: comment.trim() });
    updateTicket(ticket.id, { comments });
    setComment('');
    setRefreshKey((k) => k + 1);
  }

  function getUserName(username) {
    const u = users.find((u) => u.username === username);
    return u ? u.name : username;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link to="/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tickets
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Priority gradient top strip */}
        <div className={`h-1 bg-gradient-to-r ${priorityGradient}`}></div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-mono font-semibold">
                  {ticket.id}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {getUserName(ticket.submittedBy)} on {formatDateTime(ticket.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-xs text-gray-500">Category</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-xs text-gray-500">Subcategory</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{ticket.subcategory || '—'}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-gray-500">Location</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{ticket.location}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs text-gray-500">Assigned To</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{ticket.assignedTo ? getUserName(ticket.assignedTo) : '—'}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Actions + Comments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Admin actions */}
          {isAdmin && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>

              {/* Assign */}
              {(ticket.status === STATUSES.NEW || ticket.status === STATUSES.REOPENED) && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <label className="text-xs text-gray-500 mb-1 block">Assign to</label>
                  <div className="flex gap-2">
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Select admin...</option>
                      {admins.map((a) => (
                        <option key={a.username} value={a.username}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!assignTo}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-40 transition"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {/* Status transitions */}
              {allowedTransitions.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Change status</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note (optional)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {allowedTransitions.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${STATUS_BTN_COLORS[s] || 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                      >
                        &rarr; {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allowedTransitions.length === 0 && ticket.status !== STATUSES.NEW && ticket.status !== STATUSES.REOPENED && (
                <p className="text-sm text-gray-400 italic">No further status changes available.</p>
              )}
            </div>
          )}

          {/* Teacher actions (reopen / close) */}
          {!isAdmin && (canReopen || canClose) && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
              />
              <div className="flex gap-2">
                {canClose && (
                  <button
                    onClick={() => changeStatus(STATUSES.CLOSED)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Close Ticket
                  </button>
                )}
                {canReopen && (
                  <button
                    onClick={handleReopen}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Comments ({(ticket.comments || []).length})
            </h3>

            {(ticket.comments || []).length === 0 && (
              <p className="text-sm text-gray-400 italic mb-4">No comments yet.</p>
            )}

            <div className="space-y-3 mb-4">
              {(ticket.comments || []).map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-white">{getUserName(c.by).charAt(0)}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{getUserName(c.by)}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(c.at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {(isAdmin || isOwner) && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">{user.name.charAt(0)}</span>
                </div>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                />
                <button
                  onClick={addComment}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">History</h3>
          <TicketTimeline history={ticket.history || []} />
        </div>
      </div>
    </div>
  );
}
