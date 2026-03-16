const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Organizations
  getOrganizations: (params) => request(`/organizations?${new URLSearchParams(params || {})}`),
  getOrganization: (id) => request(`/organizations/${id}`),
  createOrganization: (data) => request('/organizations', { method: 'POST', body: JSON.stringify(data) }),
  updateOrganization: (id, data) => request(`/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrganization: (id) => request(`/organizations/${id}`, { method: 'DELETE' }),

  // People
  getPeople: (params) => request(`/people?${new URLSearchParams(params || {})}`),
  getPerson: (id) => request(`/people/${id}`),
  createPerson: (data) => request('/people', { method: 'POST', body: JSON.stringify(data) }),
  updatePerson: (id, data) => request(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePerson: (id) => request(`/people/${id}`, { method: 'DELETE' }),

  // Deals
  getDeals: (params) => request(`/deals?${new URLSearchParams(params || {})}`),
  getDeal: (id) => request(`/deals/${id}`),
  getDealActivity: (id) => request(`/deals/${id}/activity`),
  createDeal: (data) => request('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDealStage: (id, stage) => request(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ pipeline_stage: stage }) }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: 'DELETE' }),
};
