export function generateTicketId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `TKT-${dateStr}-${rand}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

export function filterTickets(tickets, filters) {
  let result = [...tickets];

  if (filters.status) {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters.category) {
    result = result.filter((t) => t.category === filters.category);
  }
  if (filters.priority) {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters.location) {
    result = result.filter((t) => t.location === filters.location);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.id.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.submittedBy.toLowerCase().includes(s) ||
        (t.subcategory && t.subcategory.toLowerCase().includes(s))
    );
  }
  if (filters.dateFrom) {
    result = result.filter((t) => new Date(t.createdAt) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((t) => new Date(t.createdAt) <= to);
  }
  if (filters.submittedBy) {
    result = result.filter((t) => t.submittedBy === filters.submittedBy);
  }

  return result;
}

export function exportToCSV(tickets) {
  const headers = ['ID', 'Status', 'Priority', 'Category', 'Subcategory', 'Location', 'Description', 'Submitted By', 'Assigned To', 'Created', 'Resolved'];
  const rows = tickets.map((t) => [
    t.id,
    t.status,
    t.priority,
    t.category,
    t.subcategory,
    t.location,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.submittedBy,
    t.assignedTo || '',
    t.createdAt,
    t.resolvedAt || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
