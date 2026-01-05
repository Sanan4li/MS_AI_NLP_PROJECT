# Backend Setup Guide

## Prerequisites

1. **PostgreSQL with pgvector extension installed**
2. **Node.js** (v18 or higher)
3. **OpenAI API Key**

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

First, create the database and enable pgvector extension:

```bash
psql -U postgres -f database-setup.sql
```

Or manually:

```sql
CREATE DATABASE qa_system;
\c qa_system;
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=qa_system

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
PORT=3000
```

### 4. Run Data Ingestion

Process the PDF documents and create embeddings:

```bash
npm run ingest
```

This will:

- Read all PDF files from the `../data/` directory
- Extract text and chunk it
- Generate embeddings using OpenAI
- Store everything in PostgreSQL

### 5. Start the Backend Server

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## API Endpoints

### POST /api/qa/ask

Ask a question and get an answer based on your documents.

**Request:**

```json
{
  "question": "What is machine learning?"
}
```

**Response:**

```json
{
  "success": true,
  "question": "What is machine learning?",
  "answer": "Machine learning is...",
  "sources": [
    {
      "content": "chunk text...",
      "document_id": "uuid",
      "chunk_index": 0
    }
  ]
}
```

### GET /api/qa/history?limit=10

Get recent question-answer history.

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "question": "What is machine learning?",
      "answer": "Machine learning is...",
      "created_at": "2026-01-04T..."
    }
  ]
}
```

## Troubleshooting

### pgvector not installed

If you get errors about vector type, make sure pgvector is installed:

```bash
# On macOS with Homebrew
brew install pgvector

# Then in psql
CREATE EXTENSION vector;
```

### OpenAI API errors

- Verify your API key is correct in `.env`
- Check your OpenAI account has credits
- Ensure you have access to the models: `text-embedding-3-small` and `gpt-4o-mini`


