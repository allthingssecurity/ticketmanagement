import { useState, useMemo } from 'react';
import { getUsers, addUser } from '../store/useStore';
import { ROLES } from '../utils/constants';
import { exportAllData, importAllData } from '../store/useStore';
import { exportJSON } from '../utils/helpers';

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'IT Admin',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PRINCIPAL]: 'Principal',
};

export default function ManageUsers() {
  const [refreshKey, setRefreshKey] = useState(0);
  const users = useMemo(() => getUsers(), [refreshKey]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: 'password', name: '', role: ROLES.TEACHER });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (users.some((u) => u.username === form.username)) {
      setError('Username already exists.');
      return;
    }

    addUser({ ...form });
    setSuccess(`User "${form.username}" created successfully.`);
    setForm({ username: '', password: 'password', name: '', role: ROLES.TEACHER });
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  }

  function handleExport() {
    const data = exportAllData();
    exportJSON(data);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importAllData(data);
        setSuccess('Data imported successfully. Refresh the page to see changes.');
        setRefreshKey((k) => k + 1);
      } catch {
        setError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} users registered</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      {/* Add user form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">New User</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="jsmith"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {Object.entries(ROLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Username</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Password</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.username} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600">{u.username}</td>
                <td className="px-4 py-3 font-mono text-gray-400">{u.password}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === ROLES.ADMIN ? 'bg-purple-100 text-purple-700' :
                    u.role === ROLES.PRINCIPAL ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data management */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Management</h3>
        <p className="text-xs text-gray-500 mb-3">Export or import all application data (users and tickets) as JSON.</p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export JSON
          </button>
          <label className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
