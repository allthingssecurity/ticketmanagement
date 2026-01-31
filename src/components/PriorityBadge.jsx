import { PRIORITY_COLORS } from '../utils/constants';

export default function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {priority}
    </span>
  );
}
