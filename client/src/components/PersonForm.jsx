import { useState, useEffect } from 'react';
import { api } from '../api';
import { CONTACT_METHODS } from './constants';

export default function PersonForm({ onSaved, onCancel, orgId, initial }) {
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState(initial || {
    org_id: orgId || '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    preferred_contact_method: 'Email',
    relationship_notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => { api.getOrganizations().then(setOrgs); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.org_id || !form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('Organization, first name, last name, and email are required');
      return;
    }
    setError('');
    if (initial?.id) {
      await api.updatePerson(initial.id, form);
    } else {
      await api.createPerson(form);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Organization *</label>
        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.org_id} onChange={set('org_id')} required>
          <option value="">Select...</option>
          {orgs.map((o) => <option key={o.id} value={o.id}>{o.company_name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.first_name} onChange={set('first_name')} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.last_name} onChange={set('last_name')} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
          <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.job_title} onChange={set('job_title')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Contact</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.preferred_contact_method} onChange={set('preferred_contact_method')}>
            {CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Relationship Notes</label>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.relationship_notes} onChange={set('relationship_notes')} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          {initial?.id ? 'Save Changes' : 'Create Contact'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
