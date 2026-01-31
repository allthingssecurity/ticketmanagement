import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
      {status}
    </span>
  );
}
