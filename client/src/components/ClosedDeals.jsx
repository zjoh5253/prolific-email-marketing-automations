import { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency, tempBadge } from './constants';
import DealDrawer from './DealDrawer';

export default function ClosedDeals() {
  const [deals, setDeals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const load = () => api.getDeals({ closed: 'true' }).then(setDeals);
  useEffect(() => { load(); }, []);

  const filtered = deals.filter((d) => {
    if (filter === 'won') return d.pipeline_stage === 'Closed Won';
    if (filter === 'lost') return d.pipeline_stage === 'Closed Lost';
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">Closed Deals</h1>
      </div>
      <div className="px-6 py-3 bg-white border-b flex gap-3">
        {['all', 'won', 'lost'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              filter === f ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f === 'all' ? 'All' : `Closed ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
              <th className="pb-2 font-medium">Company</th>
              <th className="pb-2 font-medium">Deal Name</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Value</th>
              <th className="pb-2 font-medium">Package</th>
              <th className="pb-2 font-medium">Close Date</th>
              <th className="pb-2 font-medium">Lost Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDeal(d)}>
                <td className="py-2.5 font-medium text-gray-900">{d.company_name}</td>
                <td className="py-2.5 text-gray-600">{d.deal_name}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    d.pipeline_stage === 'Closed Won' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{d.pipeline_stage === 'Closed Won' ? 'Won' : 'Lost'}</span>
                </td>
                <td className="py-2.5 font-medium">{formatCurrency(d.deal_value)}</td>
                <td className="py-2.5 text-gray-600">{d.package_type || '—'}</td>
                <td className="py-2.5 text-gray-600">{d.expected_close_date || '—'}</td>
                <td className="py-2.5 text-gray-500 text-xs">{d.lost_reason || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">No closed deals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDeal && (
        <DealDrawer dealId={selectedDeal.id} onClose={() => setSelectedDeal(null)} onSaved={() => { setSelectedDeal(null); load(); }} />
      )}
    </div>
  );
}
