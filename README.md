# CRM Pipeline App

A lightweight CRM/pipeline web application built with React + Vite and Node.js/Express with SQLite.

## Setup

```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run install:all

# Start development (frontend on :5173, backend on :3001)
npm run dev
```

The database (`data/pipeline.db`) is auto-created and seeded with sample data on first run.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, @dnd-kit (drag and drop)
- **Backend:** Node.js, Express, better-sqlite3
- **Database:** SQLite (file-based, no setup needed)

## Structure

```
/client    → React frontend app
/server    → Express API backend
/data      → SQLite database file (auto-created)
```
