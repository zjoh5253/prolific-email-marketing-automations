const express = require('express');
const cors = require('cors');
const { getDb } = require('./db/schema');
const organizationsRouter = require('./routes/organizations');
const peopleRouter = require('./routes/people');
const dealsRouter = require('./routes/deals');

const app = express();
const PORT = 3001;

// Initialize DB (creates tables if needed)
const db = getDb();

// Seed if empty
const count = db.prepare('SELECT COUNT(*) as c FROM organizations').get();
if (count.c === 0) {
  console.log('Empty database detected, running seed...');
  const { seed } = require('./db/seed');
  seed(db);
  console.log('Database seeded successfully.');
}

app.use(cors());
app.use(express.json());

app.use('/api/organizations', organizationsRouter(db));
app.use('/api/people', peopleRouter(db));
app.use('/api/deals', dealsRouter(db));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
