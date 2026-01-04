-- Create database (run this as postgres superuser)
CREATE DATABASE qa_system;

-- Connect to the database
\c qa_system;

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Note: After running this, the NestJS app will automatically create tables
-- using TypeORM synchronize feature

