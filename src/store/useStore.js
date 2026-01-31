const KEYS = {
  USERS: 'ittickets_users',
  TICKETS: 'ittickets_tickets',
  CURRENT_USER: 'ittickets_current_user',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers() {
  return read(KEYS.USERS) || [];
}

export function setUsers(users) {
  write(KEYS.USERS, users);
}

export function addUser(user) {
  const users = getUsers();
  users.push(user);
  setUsers(users);
  return users;
}

export function getTickets() {
  return read(KEYS.TICKETS) || [];
}

export function setTickets(tickets) {
  write(KEYS.TICKETS, tickets);
}

export function addTicket(ticket) {
  const tickets = getTickets();
  tickets.push(ticket);
  setTickets(tickets);
  return tickets;
}

export function updateTicket(ticketId, updates) {
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], ...updates };
    setTickets(tickets);
  }
  return tickets;
}

export function getTicketById(ticketId) {
  const tickets = getTickets();
  return tickets.find((t) => t.id === ticketId) || null;
}

export function getCurrentUser() {
  return read(KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  if (user) {
    write(KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

export function isSeeded() {
  return read(KEYS.USERS) !== null;
}

export function clearAll() {
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.TICKETS);
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function exportAllData() {
  return {
    users: getUsers(),
    tickets: getTickets(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAllData(data) {
  if (data.users) setUsers(data.users);
  if (data.tickets) setTickets(data.tickets);
}

export { KEYS };
