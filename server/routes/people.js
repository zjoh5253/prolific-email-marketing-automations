const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // GET all people
  router.get('/', (req, res) => {
    const { search, org_id } = req.query;
    let sql = `
      SELECT p.*, o.company_name
      FROM people p
      LEFT JOIN organizations o ON p.org_id = o.id
      WHERE 1=1
    `;
    const params = [];
    if (org_id) { sql += ' AND p.org_id = ?'; params.push(org_id); }
    if (search) { sql += " AND (p.first_name || ' ' || p.last_name LIKE ? OR o.company_name LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.created_at DESC';
    res.json(db.prepare(sql).all(...params));
  });

  // GET single person
  router.get('/:id', (req, res) => {
    const person = db.prepare(`
      SELECT p.*, o.company_name
      FROM people p
      LEFT JOIN organizations o ON p.org_id = o.id
      WHERE p.id = ?
    `).get(req.params.id);
    if (!person) return res.status(404).json({ error: 'Not found' });
    res.json(person);
  });

  // POST create person
  router.post('/', (req, res) => {
    const { org_id, first_name, last_name, email, phone, job_title, preferred_contact_method, relationship_notes } = req.body;
    if (!org_id || !first_name || !last_name || !email) {
      return res.status(400).json({ error: 'org_id, first_name, last_name, and email are required' });
    }
    const result = db.prepare(`
      INSERT INTO people (org_id, first_name, last_name, email, phone, job_title, preferred_contact_method, relationship_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(org_id, first_name, last_name, email, phone || '', job_title || '', preferred_contact_method || 'Email', relationship_notes || '');
    const person = db.prepare('SELECT p.*, o.company_name FROM people p LEFT JOIN organizations o ON p.org_id = o.id WHERE p.id = ?').get(result.lastInsertRowid);
    res.status(201).json(person);
  });

  // PUT update person
  router.put('/:id', (req, res) => {
    const { org_id, first_name, last_name, email, phone, job_title, preferred_contact_method, relationship_notes } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }
    db.prepare(`
      UPDATE people SET org_id=?, first_name=?, last_name=?, email=?, phone=?, job_title=?, preferred_contact_method=?, relationship_notes=?
      WHERE id=?
    `).run(org_id, first_name, last_name, email, phone || '', job_title || '', preferred_contact_method || 'Email', relationship_notes || '', req.params.id);
    const person = db.prepare('SELECT p.*, o.company_name FROM people p LEFT JOIN organizations o ON p.org_id = o.id WHERE p.id = ?').get(req.params.id);
    res.json(person);
  });

  // DELETE person
  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  return router;
};
