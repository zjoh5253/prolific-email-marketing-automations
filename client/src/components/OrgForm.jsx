import { useState } from 'react';
import { api } from '../api';
import { INDUSTRIES, SERVICE_AREAS, LEAD_SOURCES, CLIENT_STATUSES } from './constants';

export default function OrgForm({ onSaved, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    company_name: '',
    website: '',
    address: '',
    phone: '',
    industry: 'Other Trades',
    service_area: 'Local',
    lead_source: 'Referral',
    lead_source_detail: '',
    client_status: 'Prospect',
  });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) { setError('Company name is required'); return; }
    setError('');
    if (initial?.id) {
      await api.updateOrganization(initial.id, form);
    } else {
      await api.createOrganization(form);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Company Name *</label>
        <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.company_name} onChange={set('company_name')} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.website} onChange={set('website')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.address} onChange={set('address')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.industry} onChange={set('industry')}>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Service Area</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.service_area} onChange={set('service_area')}>
            {SERVICE_AREAS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.lead_source} onChange={set('lead_source')}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source Detail</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.lead_source_detail} onChange={set('lead_source_detail')} placeholder="e.g. Event name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Client Status</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.client_status} onChange={set('client_status')}>
            {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          {initial?.id ? 'Save Changes' : 'Create Organization'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
