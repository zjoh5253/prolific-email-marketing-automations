const { getDb } = require('./schema');

function seed(db) {
  const orgs = [
    { company_name: 'Arctic Comfort HVAC', website: 'https://arcticcomfort.com', address: '123 Main St, Denver, CO', phone: '303-555-0101', industry: 'HVAC', service_area: 'Regional', lead_source: 'Google Ads', lead_source_detail: '', client_status: 'Active Client' },
    { company_name: 'Summit Plumbing Co', website: 'https://summitplumbing.com', address: '456 Oak Ave, Boulder, CO', phone: '303-555-0202', industry: 'Plumbing', service_area: 'Local', lead_source: 'Referral', lead_source_detail: '', client_status: 'Prospect' },
    { company_name: 'Peak Roofing Solutions', website: 'https://peakroofing.com', address: '789 Pine St, Aurora, CO', phone: '720-555-0303', industry: 'Roofing', service_area: 'Regional', lead_source: 'Organic Search', lead_source_detail: '', client_status: 'Prospect' },
    { company_name: 'Bright Spark Electric', website: 'https://brightspark.com', address: '321 Elm Blvd, Lakewood, CO', phone: '303-555-0404', industry: 'Electrical', service_area: 'Local', lead_source: 'Event', lead_source_detail: 'Home & Garden Expo 2025', client_status: 'Prospect' },
    { company_name: 'Green Valley Landscaping', website: 'https://greenvalley.com', address: '654 Cedar Ln, Fort Collins, CO', phone: '970-555-0505', industry: 'Landscaping', service_area: 'Local', lead_source: 'Partner', lead_source_detail: '', client_status: 'Active Client' },
  ];

  const insertOrg = db.prepare(`INSERT INTO organizations (company_name, website, address, phone, industry, service_area, lead_source, lead_source_detail, client_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const o of orgs) {
    insertOrg.run(o.company_name, o.website, o.address, o.phone, o.industry, o.service_area, o.lead_source, o.lead_source_detail, o.client_status);
  }

  const contacts = [
    { org_id: 1, first_name: 'Mike', last_name: 'Johnson', email: 'mike@arcticcomfort.com', phone: '303-555-1001', job_title: 'Owner', preferred_contact_method: 'Phone', relationship_notes: 'Met at trade show' },
    { org_id: 1, first_name: 'Sarah', last_name: 'Chen', email: 'sarah@arcticcomfort.com', phone: '303-555-1002', job_title: 'Marketing Manager', preferred_contact_method: 'Email', relationship_notes: '' },
    { org_id: 2, first_name: 'Tom', last_name: 'Williams', email: 'tom@summitplumbing.com', phone: '303-555-2001', job_title: 'Owner', preferred_contact_method: 'Phone', relationship_notes: 'Referred by Mike Johnson' },
    { org_id: 3, first_name: 'Lisa', last_name: 'Park', email: 'lisa@peakroofing.com', phone: '720-555-3001', job_title: 'VP Sales', preferred_contact_method: 'Email', relationship_notes: '' },
    { org_id: 4, first_name: 'James', last_name: 'Rivera', email: 'james@brightspark.com', phone: '303-555-4001', job_title: 'General Manager', preferred_contact_method: 'Text', relationship_notes: 'Interested in full rebrand' },
    { org_id: 5, first_name: 'Amy', last_name: 'Foster', email: 'amy@greenvalley.com', phone: '970-555-5001', job_title: 'Owner', preferred_contact_method: 'Email', relationship_notes: 'Long-term partner' },
  ];

  const insertPerson = db.prepare(`INSERT INTO people (org_id, first_name, last_name, email, phone, job_title, preferred_contact_method, relationship_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const p of contacts) {
    insertPerson.run(p.org_id, p.first_name, p.last_name, p.email, p.phone, p.job_title, p.preferred_contact_method, p.relationship_notes);
  }

  const deals = [
    { org_id: 1, person_id: 1, deal_name: 'Arctic Comfort – SEO Package', package_type: 'SEO Monthly', deal_value: 2500, expected_close_date: '2026-04-15', pipeline_stage: 'Proposal / Estimate Sent', timeline: '1–3 Months', lead_temperature: 'Hot', proposal_sent: 1 },
    { org_id: 2, person_id: 3, deal_name: 'Summit Plumbing – Website Redesign', package_type: 'Web Design', deal_value: 8000, expected_close_date: '2026-05-01', pipeline_stage: 'New Lead (MQL)', timeline: '1–3 Months', lead_temperature: 'Warm', proposal_sent: 0 },
    { org_id: 3, person_id: 4, deal_name: 'Peak Roofing – Google Ads', package_type: 'PPC Management', deal_value: 3000, expected_close_date: '2026-04-30', pipeline_stage: 'Contacted / Qualifying', timeline: 'ASAP', lead_temperature: 'Hot', proposal_sent: 0 },
    { org_id: 4, person_id: 5, deal_name: 'Bright Spark – Full Marketing', package_type: 'Full Service', deal_value: 15000, expected_close_date: '2026-06-01', pipeline_stage: 'Appointment Scheduled', timeline: '3–6 Months', lead_temperature: 'Warm', proposal_sent: 0 },
    { org_id: 5, person_id: 6, deal_name: 'Green Valley – Social Media', package_type: 'Social Media', deal_value: 1500, expected_close_date: '2026-03-30', pipeline_stage: 'Decision Pending', timeline: 'ASAP', lead_temperature: 'Hot', proposal_sent: 1 },
    { org_id: 1, person_id: 2, deal_name: 'Arctic Comfort – PPC Campaign', package_type: 'PPC Management', deal_value: 4000, expected_close_date: '2026-04-20', pipeline_stage: 'Sales Qualified Lead (SQL)', timeline: '1–3 Months', lead_temperature: 'Warm', proposal_sent: 0 },
  ];

  const insertDeal = db.prepare(`INSERT INTO deals (org_id, person_id, deal_name, package_type, deal_value, expected_close_date, pipeline_stage, timeline, lead_temperature, proposal_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertActivity = db.prepare(`INSERT INTO activity_log (deal_id, action, from_stage, to_stage) VALUES (?, ?, ?, ?)`);

  for (const d of deals) {
    const result = insertDeal.run(d.org_id, d.person_id, d.deal_name, d.package_type, d.deal_value, d.expected_close_date, d.pipeline_stage, d.timeline, d.lead_temperature, d.proposal_sent);
    insertActivity.run(result.lastInsertRowid, 'Stage set', '', d.pipeline_stage);
  }
}

// Allow running directly: node db/seed.js
if (require.main === module) {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as c FROM organizations').get();
  if (count.c > 0) {
    console.log('Database already seeded.');
  } else {
    seed(db);
    console.log('Database seeded successfully.');
  }
  process.exit(0);
}

module.exports = { seed };
