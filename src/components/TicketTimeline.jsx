import { formatDateTime } from '../utils/helpers';
import { getUsers } from '../store/useStore';

export default function TicketTimeline({ history = [] }) {
  const users = getUsers();

  function getUserName(username) {
    const u = users.find((u) => u.username === username);
    return u ? u.name : username;
  }

  if (!history.length) {
    return <p className="text-sm text-gray-400 italic">No history yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
      <div className="space-y-4">
        {history.map((entry, i) => (
          <div key={i} className="relative flex gap-4 pl-8">
            <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary-400"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{entry.action}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                by {getUserName(entry.by)} &middot; {formatDateTime(entry.at)}
              </p>
              {entry.note && (
                <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
