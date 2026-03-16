const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // GET all organizations
  router.get('/', (req, res) => {
    const { client_status, industry, search } = req.query;
    let sql = `
      SELECT o.*,
        (SELECT COUNT(*) FROM deals WHERE org_id = o.id) as deal_count,
        (SELECT COUNT(*) FROM people WHERE org_id = o.id) as contact_count
      FROM organizations o WHERE 1=1
    `;
    const params = [];
    if (client_status) { sql += ' AND o.client_status = ?'; params.push(client_status); }
    if (industry) { sql += ' AND o.industry = ?'; params.push(industry); }
    if (search) { sql += ' AND o.company_name LIKE ?'; params.push(`%${search}%`); }
    sql += ' ORDER BY o.created_at DESC';
    res.json(db.prepare(sql).all(...params));
  });

  // GET single organization
  router.get('/:id', (req, res) => {
    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  });

  // POST create organization
  router.post('/', (req, res) => {
    const { company_name, website, address, phone, industry, service_area, lead_source, lead_source_detail, client_status } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name is required' });
    const result = db.prepare(`
      INSERT INTO organizations (company_name, website, address, phone, industry, service_area, lead_source, lead_source_detail, client_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(company_name, website || '', address || '', phone || '', industry || 'Other Trades', service_area || 'Local', lead_source || 'Referral', lead_source_detail || '', client_status || 'Prospect');
    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(org);
  });

  // PUT update organization
  router.put('/:id', (req, res) => {
    const { company_name, website, address, phone, industry, service_area, lead_source, lead_source_detail, client_status } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name is required' });
    db.prepare(`
      UPDATE organizations SET company_name=?, website=?, address=?, phone=?, industry=?, service_area=?, lead_source=?, lead_source_detail=?, client_status=?
      WHERE id=?
    `).run(company_name, website || '', address || '', phone || '', industry || 'Other Trades', service_area || 'Local', lead_source || 'Referral', lead_source_detail || '', client_status || 'Prospect', req.params.id);
    const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
    res.json(org);
  });

  // DELETE organization
  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM organizations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  return router;
};
