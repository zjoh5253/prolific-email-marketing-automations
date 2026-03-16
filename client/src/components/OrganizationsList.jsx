import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { INDUSTRIES, CLIENT_STATUSES } from './constants';
import Modal from './Modal';
import OrgForm from './OrgForm';

export default function OrganizationsList() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.client_status = statusFilter;
    if (industryFilter) params.industry = industryFilter;
    api.getOrganizations(params).then(setOrgs);
  };

  useEffect(() => { load(); }, [search, statusFilter, industryFilter]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">Organizations</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          + New Organization
        </button>
      </div>
      <div className="px-6 py-3 bg-white border-b flex gap-3 items-center flex-wrap">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-64"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border rounded-lg px-3 py-1.5 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="">All Industries</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
              <th className="pb-2 font-medium">Company Name</th>
              <th className="pb-2 font-medium">Industry</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Lead Source</th>
              <th className="pb-2 font-medium text-center">Deals</th>
              <th className="pb-2 font-medium text-center">Contacts</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr
                key={org.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/organizations/${org.id}`)}
              >
                <td className="py-2.5 font-medium text-gray-900">{org.company_name}</td>
                <td className="py-2.5 text-gray-600">{org.industry}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    org.client_status === 'Active Client' ? 'bg-green-100 text-green-700' :
                    org.client_status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                    org.client_status === 'Partner' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{org.client_status}</span>
                </td>
                <td className="py-2.5 text-gray-600">{org.lead_source}</td>
                <td className="py-2.5 text-center text-gray-600">{org.deal_count}</td>
                <td className="py-2.5 text-center text-gray-600">{org.contact_count}</td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No organizations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Organization">
        <OrgForm onSaved={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
