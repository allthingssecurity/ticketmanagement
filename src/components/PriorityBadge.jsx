import { PRIORITY_COLORS, PRIORITIES } from '../utils/constants';

const PRIORITY_ICONS = {
  [PRIORITIES.LOW]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  [PRIORITIES.MEDIUM]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
    </svg>
  ),
  [PRIORITIES.HIGH]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  [PRIORITIES.CRITICAL]: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
};

export default function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  const icon = PRIORITY_ICONS[priority];
  const isCritical = priority === PRIORITIES.CRITICAL;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${colors.bg} ${colors.text} ${colors.border} ${isCritical ? 'animate-pulse-glow ring-1 ring-red-300' : ''}`}>
      {icon}
      {priority}
    </span>
  );
}
