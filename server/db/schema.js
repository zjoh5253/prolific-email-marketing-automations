const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'pipeline.db');

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      website TEXT DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      industry TEXT DEFAULT 'Other Trades',
      service_area TEXT DEFAULT 'Local',
      lead_source TEXT DEFAULT 'Referral',
      lead_source_detail TEXT DEFAULT '',
      client_status TEXT DEFAULT 'Prospect',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      job_title TEXT DEFAULT '',
      preferred_contact_method TEXT DEFAULT 'Email',
      relationship_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
      deal_name TEXT DEFAULT '',
      package_type TEXT DEFAULT '',
      deal_value REAL DEFAULT 0,
      expected_close_date TEXT DEFAULT '',
      pipeline_stage TEXT DEFAULT 'New Lead (MQL)',
      timeline TEXT DEFAULT 'Exploring',
      lead_temperature TEXT DEFAULT 'Warm',
      proposal_sent INTEGER DEFAULT 0,
      lost_reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      from_stage TEXT DEFAULT '',
      to_stage TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

module.exports = { getDb };
