-- Initial database setup (runs once on first postgres start)
-- This is for any setup that Prisma migrations don't handle

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search / fuzzy matching

-- Grant privileges (if needed for additional users)
-- GRANT ALL PRIVILEGES ON DATABASE prolific_email TO prolific;

-- Note: Actual table creation is handled by Prisma migrations
