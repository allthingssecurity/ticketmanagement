import { formatDateTime } from '../utils/helpers';
import { getUsers } from '../store/useStore';

const ACTION_COLORS = {
  Created: { dot: 'bg-blue-500', icon: 'plus' },
  Assigned: { dot: 'bg-purple-500', icon: 'person' },
  Resolved: { dot: 'bg-green-500', icon: 'check' },
  Closed: { dot: 'bg-gray-500', icon: 'check' },
  Reopened: { dot: 'bg-red-500', icon: 'refresh' },
  'In Progress': { dot: 'bg-yellow-500', icon: 'play' },
  'On Hold': { dot: 'bg-orange-500', icon: 'pause' },
};

function getActionStyle(action) {
  for (const [key, val] of Object.entries(ACTION_COLORS)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { dot: 'bg-blue-400', icon: 'default' };
}

const ICONS = {
  plus: (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
  ),
  person: (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  check: (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  refresh: (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  play: (
    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  pause: (
    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  ),
  default: (
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function TicketTimeline({ history = [] }) {
  const users = getUsers();

  function getUserName(username) {
    const u = users.find((u) => u.username === username);
    return u ? u.name : username;
  }

  if (!history.length) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 italic">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-gray-200"></div>
      <div className="space-y-4">
        {history.map((entry, i) => {
          const style = getActionStyle(entry.action);
          return (
            <div key={i} className="relative flex gap-4 pl-10">
              <div className={`absolute left-[4px] top-1 w-5 h-5 rounded-full ${style.dot} ring-2 ring-white flex items-center justify-center shadow-sm`}>
                {ICONS[style.icon] || ICONS.default}
              </div>
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  by {getUserName(entry.by)} &middot; {formatDateTime(entry.at)}
                </p>
                {entry.note && (
                  <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
