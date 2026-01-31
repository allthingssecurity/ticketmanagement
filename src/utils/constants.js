export const ROLES = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
};

export const STATUSES = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const STATUS_FLOW = {
  [STATUSES.NEW]: [STATUSES.ASSIGNED],
  [STATUSES.ASSIGNED]: [STATUSES.IN_PROGRESS, STATUSES.ON_HOLD],
  [STATUSES.IN_PROGRESS]: [STATUSES.ON_HOLD, STATUSES.RESOLVED],
  [STATUSES.ON_HOLD]: [STATUSES.ASSIGNED, STATUSES.IN_PROGRESS],
  [STATUSES.RESOLVED]: [STATUSES.CLOSED],
  [STATUSES.CLOSED]: [],
  [STATUSES.REOPENED]: [STATUSES.IN_PROGRESS],
};

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const CATEGORIES = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
};

export const SUBCATEGORIES = {
  Hardware: [
    'Desktop/Laptop',
    'Printer/Scanner',
    'Projector/Display',
    'Network Equipment',
    'Keyboard/Mouse',
    'Monitor',
    'Phone/Tablet',
    'Other Hardware',
  ],
  Software: [
    'Operating System',
    'Microsoft Office',
    'Email/Outlook',
    'Browser',
    'Learning Management System',
    'Grading Software',
    'Antivirus/Security',
    'Network/Internet',
    'Account/Password',
    'Other Software',
  ],
};

export const LOCATIONS = [
  'Room 101',
  'Room 102',
  'Room 103',
  'Room 104',
  'Room 105',
  'Room 201',
  'Room 202',
  'Room 203',
  'Room 204',
  'Room 205',
  'Computer Lab A',
  'Computer Lab B',
  'Library',
  'Auditorium',
  'Main Office',
  'Teacher Lounge',
  'Gymnasium',
  'Cafeteria',
  'Science Lab',
  'Art Room',
];

export const STATUS_COLORS = {
  [STATUSES.NEW]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', border: 'border-blue-300', gradient: 'from-blue-500 to-blue-600' },
  [STATUSES.ASSIGNED]: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', border: 'border-purple-300', gradient: 'from-purple-500 to-purple-600' },
  [STATUSES.IN_PROGRESS]: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', border: 'border-yellow-300', gradient: 'from-yellow-500 to-yellow-600' },
  [STATUSES.ON_HOLD]: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', border: 'border-orange-300', gradient: 'from-orange-500 to-orange-600' },
  [STATUSES.RESOLVED]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', border: 'border-green-300', gradient: 'from-green-500 to-green-600' },
  [STATUSES.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', border: 'border-gray-300', gradient: 'from-gray-500 to-gray-600' },
  [STATUSES.REOPENED]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', border: 'border-red-300', gradient: 'from-red-500 to-red-600' },
};

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  [PRIORITIES.MEDIUM]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  [PRIORITIES.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  [PRIORITIES.CRITICAL]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};
