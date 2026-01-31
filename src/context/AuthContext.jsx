import { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, setUsers, setTickets, getCurrentUser, setCurrentUser, isSeeded } from '../store/useStore';
import { DEFAULT_USERS, SAMPLE_TICKETS } from '../data/seed';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSeeded()) {
      setUsers(DEFAULT_USERS);
      setTickets(SAMPLE_TICKETS);
    }
    const saved = getCurrentUser();
    if (saved) {
      setUser(saved);
    }
    setLoading(false);
  }, []);

  function login(username, password) {
    const users = getUsers();
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      const userData = { username: found.username, name: found.name, role: found.role };
      setUser(userData);
      setCurrentUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  }

  function logout() {
    setUser(null);
    setCurrentUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
