import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addTicket } from '../store/useStore';
import { generateTicketId } from '../utils/helpers';
import { CATEGORIES, SUBCATEGORIES, PRIORITIES, LOCATIONS, STATUSES } from '../utils/constants';

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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
        <p className="text-gray-600 mb-1">Your ticket has been created successfully.</p>
        <p className="text-sm text-gray-500 mb-6">
          Ticket ID: <span className="font-mono font-medium text-primary-600">{ticketId}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/tickets/${ticketId}`)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
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
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition ${
                  form.category === cat
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
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
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                    form.priority === p ? activeColor : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
