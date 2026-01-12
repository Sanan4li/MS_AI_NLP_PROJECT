# Document Q&A System with Generative AI

A full-stack Question-Answer system that uses RAG (Retrieval-Augmented Generation) to answer questions based on your own documents. Built with NestJS, React, PostgreSQL with pgvector, and OpenAI.

## Video Demo

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/https://www.youtube.com/watch?v=m0J9JENuls0/0.jpg)](https://www.youtube.com/watch?v=m0J9JENuls0)

## Architecture

```
┌─────────────────┐
│   PDF Documents │
│   (data/)       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Data Ingestion Script  │
│  • PDF Parser           │
│  • Text Chunker         │
│  • Embedding Generator  │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────┐
│  PostgreSQL + pgvector     │
│  • documents table         │
│  • embeddings table        │
│  • qa_history table        │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  NestJS Backend (Port 3000) │
│  • Embedding Service        │
│  • Search Service           │
│  • QA Controller            │
│  • OpenAI Integration       │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  React Frontend (Port 5173)  │
│  • Question Input            │
│  • Answer Display            │
│  • History Panel             │
└──────────────────────────────┘
```

## Features

- 📄 **PDF Document Processing**: Automatically extract and chunk text from PDF documents
- 🔍 **Semantic Search**: Use mxbai-embed-large embeddings for accurate similarity search
- 🤖 **AI-Powered Answers**: Generate contextual answers using gemma3:4b
- 💾 **Persistent Storage**: Store embeddings and Q&A history in PostgreSQL
- 🎨 **Modern UI**: Beautiful, responsive React interface
- 📊 **Question History**: View and revisit previous questions

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **pgvector** extension for PostgreSQL
- **OpenAI API Key**

## Installation

### 1. Install PostgreSQL and pgvector

**macOS (Homebrew):**

```bash
brew install postgresql pgvector
brew services start postgresql
```

**Ubuntu/Debian:**

```bash
sudo apt-get install postgresql postgresql-contrib
# Follow pgvector installation from: https://github.com/pgvector/pgvector
```

### 2. Setup Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql, run:
CREATE DATABASE qa_system;
\c qa_system;
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

Or use the provided script:

```bash
psql -U postgres -f backend/database-setup.sql
```

### 3. Configure Backend

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=qa_system



# Application Configuration
PORT=3000
```

### 4. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

## Usage

### Step 1: Add Your Documents

Place your PDF documents in the `data/` folder. The system currently includes:

- UET Lahore department-related documents

### Step 2: Run Data Ingestion

This processes PDFs and creates embeddings:

```bash
cd backend
npm run ingest
```

This will:

1. Read all PDF files from `data/`
2. Extract and chunk text
3. Generate embeddings using OpenAI
4. Store everything in PostgreSQL

**Note**: This process may take a few minutes depending on the number and size of documents.

### Step 3: Start the Backend

In the `backend/` directory:

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend will be available at: http://localhost:3000

### Step 4: Start the Frontend

In the `frontend/` directory:

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

### Step 5: Ask Questions!

1. Open http://localhost:5173 in your browser
2. Type a question about your documents
3. Click "Ask" and wait for the AI-generated answer
4. View sources and previous questions in the sidebar

## API Endpoints

### POST /api/qa/ask

Ask a question and get an AI-generated answer.

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
  "answer": "Machine learning is a subset of artificial intelligence...",
  "sources": [
    "Machine learning algorithms...",
    "Artificial intelligence is the simulation of human intelligence in machines..."
  ]
}
```

### GET /api/qa/history?limit=10

Get recent Q&A history.

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "question": "What is machine learning?",
      "answer": "Machine learning is...",
      "created_at": "2026-01-04T10:30:00Z"
    }
  ]
}
```

## Project Structure

```
NLP_Project/
├── data/                          # PDF documents
├── backend/                       # NestJS Backend
│   ├── src/
│   │   ├── config/               # Database configuration
│   │   ├── entities/             # TypeORM entities
│   │   │   ├── document.entity.ts
│   │   │   ├── embedding.entity.ts
│   │   │   └── qa-history.entity.ts
│   │   ├── modules/
│   │   │   ├── embedding/        # Embedding generation service
│   │   │   ├── document/         # Document management
│   │   │   └── qa/              # Question-answer logic
│   │   ├── scripts/
│   │   │   └── ingest-documents.ts  # Data ingestion script
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── database-setup.sql        # Database initialization
│   ├── package.json
│   └── README_SETUP.md
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionInput.tsx    # Question input form
│   │   │   ├── AnswerDisplay.tsx    # Answer display
│   │   │   └── HistoryPanel.tsx     # Q&A history
│   │   ├── services/
│   │   │   └── api.ts              # API service
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md                      # This file
```

## Technology Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **PostgreSQL** - Relational database
- **pgvector** - Vector similarity search
- **OpenAI API** - Embeddings and text generation
- **pdf-parse** - PDF text extraction

### Frontend

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Axios** - HTTP client

### AI/ML

- **mxbai-embed-large** - Embedding model (1536 dimensions)
- **gemma3:4b** - Text generation model

## How It Works

### 1. Document Ingestion

- PDFs are parsed and text is extracted
- Text is chunked into ~1000 character segments
- Each chunk is converted to a vector embedding (1536 dimensions)
- Embeddings are stored in PostgreSQL with pgvector

### 2. Question Answering

- User question is converted to embedding
- Vector similarity search finds top 5 relevant chunks
- Relevant chunks form the context for the LLM
- GPT-4o-mini generates an answer based on context
- Answer and sources are returned to user
- Q&A is stored in history

### 3. Vector Search

Uses pgvector's cosine distance operator for similarity:

```sql
SELECT * FROM embeddings
ORDER BY embedding <=> '[query_vector]'
LIMIT 5;
```

## Troubleshooting

### Backend won't start

- Ensure PostgreSQL is running: `brew services list` (macOS)
- Verify database credentials in `.env`
- Check if port 3000 is available

### pgvector errors

```bash
# Install pgvector
brew install pgvector

# Enable in database
psql -U postgres -d qa_system -c "CREATE EXTENSION vector;"
```

### Ollama API errors

- Verify API key in `.env`
- Check Ollama account has credits
- Ensure access to required models: mxbai-embed-large and gemma3:4b

### Frontend can't connect to backend

- Verify backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`
- Ensure API_BASE_URL is correct in `frontend/src/services/api.ts`

### Ingestion takes too long

- The process creates embeddings for all document chunks
- Large documents take more time
- OpenAI API has rate limits
- Be patient, it only needs to run once per document

## Performance Considerations

- **Chunk Size**: 1000 characters balances context and precision
- **Top K**: Returns 5 most relevant chunks by default
- **Embeddings**: Cached in database for fast retrieval
- **Batch Processing**: Processes embeddings in batches of 10

## Future Enhancements

- [ ] Support for more document formats (DOCX, TXT, etc.)
- [ ] User authentication and multi-tenancy
- [ ] Document management UI (upload, delete)
- [ ] Advanced search filters
- [ ] Export Q&A history
- [ ] Streaming responses
- [ ] Citation links to original documents

## License

This project is for educational purposes.

## Credits

Built with ❤️ by Sanan and Team using Ollama, NestJS, React, and PostgreSQL with pgvector.
