import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Modal from './Modal';
import PersonForm from './PersonForm';

export default function PeopleList() {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const load = () => {
    const params = {};
    if (search) params.search = search;
    api.getPeople(params).then(setPeople);
  };

  useEffect(() => { load(); }, [search]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">People</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          + New Contact
        </button>
      </div>
      <div className="px-6 py-3 bg-white border-b">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-64"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
              <th className="pb-2 font-medium">Full Name</th>
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Company</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Phone</th>
              <th className="pb-2 font-medium">Preferred</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPerson(p)}>
                <td className="py-2.5 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
                <td className="py-2.5 text-gray-600">{p.job_title}</td>
                <td className="py-2.5">
                  <Link to={`/organizations/${p.org_id}`} className="text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    {p.company_name}
                  </Link>
                </td>
                <td className="py-2.5 text-gray-600">{p.email}</td>
                <td className="py-2.5 text-gray-600">{p.phone}</td>
                <td className="py-2.5 text-gray-600">{p.preferred_contact_method}</td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No contacts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Contact">
        <PersonForm onSaved={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
      </Modal>

      {selectedPerson && (
        <PersonDetail person={selectedPerson} onClose={() => setSelectedPerson(null)} onSaved={() => { setSelectedPerson(null); load(); }} />
      )}
    </div>
  );
}

function PersonDetail({ person, onClose, onSaved }) {
  const [p, setP] = useState(person);
  const [deals, setDeals] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.getPerson(person.id).then(setP);
    api.getDeals({ org_id: person.org_id }).then((all) => {
      setDeals(all.filter((d) => d.person_id === person.id));
    });
  }, [person.id]);

  return (
    <Modal open={true} onClose={onClose} title={`${p.first_name} ${p.last_name}`}>
      {editing ? (
        <PersonForm
          initial={p}
          orgId={p.org_id}
          onSaved={() => { setEditing(false); onSaved(); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Email', p.email],
              ['Phone', p.phone],
              ['Job Title', p.job_title],
              ['Preferred Contact', p.preferred_contact_method],
              ['Company', p.company_name],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm text-gray-900">{value || '—'}</div>
              </div>
            ))}
          </div>
          {p.relationship_notes && (
            <div>
              <div className="text-xs text-gray-500">Relationship Notes</div>
              <div className="text-sm text-gray-900">{p.relationship_notes}</div>
            </div>
          )}
          <button onClick={() => setEditing(true)} className="text-sm text-indigo-600 hover:underline">Edit Contact</button>

          {deals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Linked Deals</h3>
              {deals.map((d) => (
                <div key={d.id} className="text-sm text-gray-600 py-1">{d.deal_name} – {d.pipeline_stage}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
