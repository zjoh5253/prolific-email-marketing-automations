import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { formatCurrency, tempBadge } from './constants';
import Modal from './Modal';
import OrgForm from './OrgForm';
import PersonForm from './PersonForm';
import DealForm from './DealForm';
import DealDrawer from './DealDrawer';

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const load = () => {
    api.getOrganization(id).then(setOrg);
    api.getPeople({ org_id: id }).then(setContacts);
    api.getDeals({ org_id: id }).then(setDeals);
  };

  useEffect(() => { load(); }, [id]);

  if (!org) return <div className="p-6 text-gray-400">Loading...</div>;

  const tabs = ['overview', 'contacts', 'deals'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/organizations')} className="text-gray-400 hover:text-gray-600">&larr;</button>
          <h1 className="text-xl font-bold text-gray-900">{org.company_name}</h1>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            org.client_status === 'Active Client' ? 'bg-green-100 text-green-700' :
            org.client_status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-600'
          }`}>{org.client_status}</span>
        </div>
        <button onClick={() => setEditing(true)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Edit</button>
      </div>

      <div className="px-6 border-b bg-white">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            {[
              ['Industry', org.industry],
              ['Service Area', org.service_area],
              ['Lead Source', org.lead_source + (org.lead_source_detail ? ` – ${org.lead_source_detail}` : '')],
              ['Website', org.website],
              ['Phone', org.phone],
              ['Address', org.address],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm text-gray-900">{value || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'contacts' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Contacts ({contacts.length})</h2>
              <button onClick={() => setShowAddContact(true)} className="text-sm text-indigo-600 hover:underline">+ Add Contact</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Preferred</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
                    <td className="py-2 text-gray-600">{p.job_title}</td>
                    <td className="py-2 text-gray-600">{p.email}</td>
                    <td className="py-2 text-gray-600">{p.phone}</td>
                    <td className="py-2 text-gray-600">{p.preferred_contact_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'deals' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Deals ({deals.length})</h2>
              <button onClick={() => setShowAddDeal(true)} className="text-sm text-indigo-600 hover:underline">+ Add Deal</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
                  <th className="pb-2 font-medium">Deal Name</th>
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Temperature</th>
                  <th className="pb-2 font-medium">Close Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDeal(d)}>
                    <td className="py-2 font-medium text-gray-900">{d.deal_name}</td>
                    <td className="py-2 text-gray-600 text-xs">{d.pipeline_stage}</td>
                    <td className="py-2 font-medium">{formatCurrency(d.deal_value)}</td>
                    <td className="py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${tempBadge(d.lead_temperature)}`}>{d.lead_temperature}</span></td>
                    <td className="py-2 text-gray-600">{d.expected_close_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Organization">
        <OrgForm initial={org} onSaved={() => { setEditing(false); load(); }} onCancel={() => setEditing(false)} />
      </Modal>

      <Modal open={showAddContact} onClose={() => setShowAddContact(false)} title="Add Contact">
        <PersonForm orgId={Number(id)} onSaved={() => { setShowAddContact(false); load(); }} onCancel={() => setShowAddContact(false)} />
      </Modal>

      <Modal open={showAddDeal} onClose={() => setShowAddDeal(false)} title="Add Deal">
        <DealForm initialOrgId={Number(id)} onSaved={() => { setShowAddDeal(false); load(); }} onCancel={() => setShowAddDeal(false)} />
      </Modal>

      {selectedDeal && (
        <DealDrawer dealId={selectedDeal.id} onClose={() => setSelectedDeal(null)} onSaved={() => { setSelectedDeal(null); load(); }} />
      )}
    </div>
  );
}
