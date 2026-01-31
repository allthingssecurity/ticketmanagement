export default function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  const colorMap = {
    primary: {
      border: 'border-l-blue-500',
      bg: 'bg-gradient-to-r from-blue-50 to-white',
      iconBg: 'bg-blue-500',
      iconShadow: 'shadow-blue-200',
    },
    success: {
      border: 'border-l-green-500',
      bg: 'bg-gradient-to-r from-green-50 to-white',
      iconBg: 'bg-green-500',
      iconShadow: 'shadow-green-200',
    },
    warning: {
      border: 'border-l-yellow-500',
      bg: 'bg-gradient-to-r from-yellow-50 to-white',
      iconBg: 'bg-yellow-500',
      iconShadow: 'shadow-yellow-200',
    },
    danger: {
      border: 'border-l-red-500',
      bg: 'bg-gradient-to-r from-red-50 to-white',
      iconBg: 'bg-red-500',
      iconShadow: 'shadow-red-200',
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-gradient-to-r from-purple-50 to-white',
      iconBg: 'bg-purple-500',
      iconShadow: 'shadow-purple-200',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`rounded-xl border border-gray-200 border-l-4 ${c.border} ${c.bg} p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${c.iconBg} text-white shadow-lg ${c.iconShadow}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
