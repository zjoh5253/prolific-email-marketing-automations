const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  const DEAL_SELECT = `
    SELECT d.*, o.company_name,
      CASE WHEN d.person_id IS NOT NULL THEN p.first_name || ' ' || p.last_name ELSE NULL END as contact_name
    FROM deals d
    LEFT JOIN organizations o ON d.org_id = o.id
    LEFT JOIN people p ON d.person_id = p.id
  `;

  // GET all deals (pipeline view)
  router.get('/', (req, res) => {
    const { stage, closed, org_id, search } = req.query;
    let sql = DEAL_SELECT + ' WHERE 1=1';
    const params = [];
    if (stage) { sql += ' AND d.pipeline_stage = ?'; params.push(stage); }
    if (closed === 'true') {
      sql += " AND d.pipeline_stage IN ('Closed Won', 'Closed Lost')";
    } else if (closed === 'false') {
      sql += " AND d.pipeline_stage NOT IN ('Closed Won', 'Closed Lost')";
    }
    if (org_id) { sql += ' AND d.org_id = ?'; params.push(org_id); }
    if (search) { sql += ' AND (d.deal_name LIKE ? OR o.company_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY d.updated_at DESC';
    res.json(db.prepare(sql).all(...params));
  });

  // GET single deal
  router.get('/:id', (req, res) => {
    const deal = db.prepare(DEAL_SELECT + ' WHERE d.id = ?').get(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Not found' });
    res.json(deal);
  });

  // GET activity log for a deal
  router.get('/:id/activity', (req, res) => {
    const logs = db.prepare('SELECT * FROM activity_log WHERE deal_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(logs);
  });

  // POST create deal
  router.post('/', (req, res) => {
    const { org_id, person_id, deal_name, package_type, deal_value, expected_close_date, pipeline_stage, timeline, lead_temperature, proposal_sent, lost_reason } = req.body;
    if (!org_id) return res.status(400).json({ error: 'org_id is required' });

    // Auto-generate deal name if blank
    let name = deal_name;
    if (!name) {
      const org = db.prepare('SELECT company_name FROM organizations WHERE id = ?').get(org_id);
      name = org ? `${org.company_name} – New Deal` : 'New Deal';
    }

    const stage = pipeline_stage || 'New Lead (MQL)';
    const result = db.prepare(`
      INSERT INTO deals (org_id, person_id, deal_name, package_type, deal_value, expected_close_date, pipeline_stage, timeline, lead_temperature, proposal_sent, lost_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(org_id, person_id || null, name, package_type || '', deal_value || 0, expected_close_date || '', stage, timeline || 'Exploring', lead_temperature || 'Warm', proposal_sent ? 1 : 0, lost_reason || '');

    db.prepare('INSERT INTO activity_log (deal_id, action, from_stage, to_stage) VALUES (?, ?, ?, ?)').run(result.lastInsertRowid, 'Deal created', '', stage);

    const deal = db.prepare(DEAL_SELECT + ' WHERE d.id = ?').get(result.lastInsertRowid);
    res.status(201).json(deal);
  });

  // PUT update deal
  router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const { org_id, person_id, deal_name, package_type, deal_value, expected_close_date, pipeline_stage, timeline, lead_temperature, proposal_sent, lost_reason } = req.body;

    const newStage = pipeline_stage || existing.pipeline_stage;
    if (newStage !== existing.pipeline_stage) {
      db.prepare('INSERT INTO activity_log (deal_id, action, from_stage, to_stage) VALUES (?, ?, ?, ?)').run(req.params.id, 'Stage changed', existing.pipeline_stage, newStage);
    }

    db.prepare(`
      UPDATE deals SET org_id=?, person_id=?, deal_name=?, package_type=?, deal_value=?, expected_close_date=?, pipeline_stage=?, timeline=?, lead_temperature=?, proposal_sent=?, lost_reason=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      org_id || existing.org_id,
      person_id !== undefined ? (person_id || null) : existing.person_id,
      deal_name || existing.deal_name,
      package_type !== undefined ? package_type : existing.package_type,
      deal_value !== undefined ? deal_value : existing.deal_value,
      expected_close_date !== undefined ? expected_close_date : existing.expected_close_date,
      newStage,
      timeline || existing.timeline,
      lead_temperature || existing.lead_temperature,
      proposal_sent !== undefined ? (proposal_sent ? 1 : 0) : existing.proposal_sent,
      lost_reason !== undefined ? lost_reason : existing.lost_reason,
      req.params.id
    );

    const deal = db.prepare(DEAL_SELECT + ' WHERE d.id = ?').get(req.params.id);
    res.json(deal);
  });

  // PATCH update stage only (for drag and drop)
  router.patch('/:id/stage', (req, res) => {
    const { pipeline_stage } = req.body;
    if (!pipeline_stage) return res.status(400).json({ error: 'pipeline_stage is required' });

    const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    if (pipeline_stage !== existing.pipeline_stage) {
      db.prepare('INSERT INTO activity_log (deal_id, action, from_stage, to_stage) VALUES (?, ?, ?, ?)').run(req.params.id, 'Stage changed', existing.pipeline_stage, pipeline_stage);
    }

    db.prepare("UPDATE deals SET pipeline_stage = ?, updated_at = datetime('now') WHERE id = ?").run(pipeline_stage, req.params.id);
    const deal = db.prepare(DEAL_SELECT + ' WHERE d.id = ?').get(req.params.id);
    res.json(deal);
  });

  // DELETE deal
  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  return router;
};
