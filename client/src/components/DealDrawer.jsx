import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PIPELINE_STAGES, ALL_STAGES, TIMELINES, LEAD_TEMPS, tempBadge, formatCurrency } from './constants';
import Modal from './Modal';

export default function DealDrawer({ dealId, onClose, onSaved }) {
  const [deal, setDeal] = useState(null);
  const [activity, setActivity] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [orgs, setOrgs] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    api.getDeal(dealId).then((d) => { setDeal(d); setForm(d); });
    api.getDealActivity(dealId).then(setActivity);
    api.getOrganizations().then(setOrgs);
    api.getPeople().then(setPeople);
  }, [dealId]);

  if (!deal) return null;

  const handleSave = async () => {
    await api.updateDeal(deal.id, form);
    onSaved();
  };

  const handleStageClick = (stage) => {
    setForm((f) => ({ ...f, pipeline_stage: stage }));
  };

  const handleClose = async (status) => {
    const updates = { ...form, pipeline_stage: status };
    if (status === 'Closed Won') updates.lost_reason = '';
    setForm(updates);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const isEditing = editing;
  const currentStage = form.pipeline_stage || deal.pipeline_stage;

  return (
    <Modal open={true} onClose={onClose} title={deal.deal_name} wide>
      <div className="space-y-6">
        {/* Stage Stepper */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Pipeline Stage</label>
          <div className="flex gap-1 flex-wrap">
            {PIPELINE_STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  currentStage === stage
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleClose('Closed Won')}
              className={`px-3 py-1.5 text-xs rounded font-medium ${
                currentStage === 'Closed Won' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Mark as Closed Won
            </button>
            <button
              onClick={() => handleClose('Closed Lost')}
              className={`px-3 py-1.5 text-xs rounded font-medium ${
                currentStage === 'Closed Lost' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Mark as Closed Lost
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-4 text-sm">
          <Link to={`/organizations/${deal.org_id}`} className="text-indigo-600 hover:underline" onClick={onClose}>
            {deal.company_name}
          </Link>
          {deal.contact_name && (
            <span className="text-gray-500">Contact: {deal.contact_name}</span>
          )}
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Deal Name</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.deal_name || ''} onChange={set('deal_name')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Organization *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.org_id || ''} onChange={set('org_id')}>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.person_id || ''} onChange={set('person_id')}>
              <option value="">None</option>
              {people.filter((p) => String(p.org_id) === String(form.org_id)).map((p) => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Package Type</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.package_type || ''} onChange={set('package_type')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Deal Value ($)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.deal_value || ''} onChange={set('deal_value')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Expected Close Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.expected_close_date || ''} onChange={set('expected_close_date')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Timeline</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.timeline || ''} onChange={set('timeline')}>
              {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lead Temperature</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.lead_temperature || ''} onChange={set('lead_temperature')}>
              {LEAD_TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <input type="checkbox" id="proposal_sent" checked={!!form.proposal_sent} onChange={(e) => setForm((f) => ({ ...f, proposal_sent: e.target.checked }))} />
            <label htmlFor="proposal_sent" className="text-sm text-gray-700">Proposal Sent</label>
          </div>
        </div>

        {/* Lost Reason */}
        {currentStage === 'Closed Lost' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lost Reason *</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.lost_reason || ''} onChange={set('lost_reason')} />
          </div>
        )}

        {/* Save */}
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Save Changes
          </button>
        </div>

        {/* Activity Log */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {activity.length === 0 && <p className="text-xs text-gray-400">No activity yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                <span>{a.action}{a.from_stage ? `: ${a.from_stage} → ${a.to_stage}` : a.to_stage ? `: → ${a.to_stage}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
