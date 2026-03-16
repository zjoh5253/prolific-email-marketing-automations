import { useState, useEffect } from 'react';
import { api } from '../api';
import { PIPELINE_STAGES, TIMELINES, LEAD_TEMPS } from './constants';

export default function DealForm({ onSaved, onCancel, initialOrgId }) {
  const [orgs, setOrgs] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState({
    org_id: initialOrgId || '',
    person_id: '',
    deal_name: '',
    package_type: '',
    deal_value: '',
    expected_close_date: '',
    pipeline_stage: 'New Lead (MQL)',
    timeline: 'Exploring',
    lead_temperature: 'Warm',
    proposal_sent: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrganizations().then(setOrgs);
    api.getPeople().then(setPeople);
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.org_id) { setError('Organization is required'); return; }
    setError('');
    await api.createDeal({ ...form, deal_value: Number(form.deal_value) || 0, proposal_sent: form.proposal_sent ? 1 : 0 });
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
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.person_id} onChange={set('person_id')}>
          <option value="">None</option>
          {people.filter((p) => String(p.org_id) === String(form.org_id)).map((p) => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Deal Name</label>
        <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.deal_name} onChange={set('deal_name')} placeholder="Auto-generated if blank" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Package Type</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.package_type} onChange={set('package_type')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Deal Value ($)</label>
          <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.deal_value} onChange={set('deal_value')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Expected Close Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.expected_close_date} onChange={set('expected_close_date')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Stage</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.pipeline_stage} onChange={set('pipeline_stage')}>
            {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Timeline</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.timeline} onChange={set('timeline')}>
            {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lead Temperature</label>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.lead_temperature} onChange={set('lead_temperature')}>
            {LEAD_TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Create Deal</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
