import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addTicket } from '../store/useStore';
import { generateTicketId } from '../utils/helpers';
import { CATEGORIES, SUBCATEGORIES, PRIORITIES, LOCATIONS, STATUSES } from '../utils/constants';

const CATEGORY_ICONS = {
  Hardware: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Software: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

const PRIORITY_ICONS = {
  Low: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Medium: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
    </svg>
  ),
  High: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  Critical: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
};

export default function SubmitTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [form, setForm] = useState({
    category: CATEGORIES.HARDWARE,
    subcategory: '',
    location: '',
    priority: PRIORITIES.MEDIUM,
    description: '',
  });

  function handleChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        next.subcategory = '';
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const id = generateTicketId();
    const now = new Date().toISOString();

    const ticket = {
      id,
      status: STATUSES.NEW,
      priority: form.priority,
      category: form.category,
      subcategory: form.subcategory,
      location: form.location,
      description: form.description,
      submittedBy: user.username,
      createdAt: now,
      history: [
        { action: 'Created', by: user.username, at: now, note: 'Ticket submitted' },
      ],
      comments: [],
    };

    addTicket(ticket);
    setTicketId(id);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto text-center py-12">
        <div className="animate-bounce-in inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-4 shadow-lg shadow-green-200 relative">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
        <p className="text-gray-600 mb-1">Your ticket has been created successfully.</p>
        <p className="text-sm text-gray-500 mb-6">
          Ticket ID: <span className="font-mono font-medium text-primary-600">{ticketId}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/tickets/${ticketId}`)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition text-sm font-medium shadow-md shadow-blue-200"
          >
            View Ticket
          </button>
          <button
            onClick={() => { setSubmitted(false); setForm({ category: CATEGORIES.HARDWARE, subcategory: '', location: '', priority: PRIORITIES.MEDIUM, description: '' }); }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const subcategories = SUBCATEGORIES[form.category] || [];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Ticket</h1>
        <p className="text-gray-500 mt-1">Report an IT issue and we'll get it resolved.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Submitter info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Submitting as</p>
          <p className="font-medium text-gray-900">{user.name} <span className="text-gray-400 font-normal">({user.username})</span></p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <select
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
          >
            <option value="">Select location...</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <div className="flex gap-3">
            {Object.values(CATEGORIES).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 px-4 rounded-lg border text-sm font-medium transition ${
                  form.category === cat
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={form.category === cat ? 'text-primary-500' : 'text-gray-400'}>
                  {CATEGORY_ICONS[cat]}
                </span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
          <select
            value={form.subcategory}
            onChange={(e) => handleChange('subcategory', e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
          >
            <option value="">Select subcategory...</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(PRIORITIES).map((p) => {
              const colorMap = {
                Low: 'border-gray-300 bg-gray-50 text-gray-700',
                Medium: 'border-blue-300 bg-blue-50 text-blue-700',
                High: 'border-orange-300 bg-orange-50 text-orange-700',
                Critical: 'border-red-300 bg-red-50 text-red-700',
              };
              const activeColor = colorMap[p] || '';
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleChange('priority', p)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                    form.priority === p ? activeColor + ' shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className={form.priority === p ? '' : 'text-gray-400'}>
                    {PRIORITY_ICONS[p]}
                  </span>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
            placeholder="Describe the issue in detail. Include any error messages, what you were doing when it happened, and any troubleshooting steps you've already tried."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
