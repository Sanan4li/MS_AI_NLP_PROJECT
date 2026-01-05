# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                   React Frontend (Port 5173)                     │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Question Input│  │Answer Display│  │  History Panel   │    │
│  └───────────────┘  └──────────────┘  └──────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     BACKEND SERVER                               │
│                 NestJS Backend (Port 3000)                       │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ QA Controller│  │QA Service   │  │  Embedding Service   │  │
│  └──────┬───────┘  └──────┬──────┘  └──────────┬───────────┘  │
│         │                  │                     │               │
│         │         ┌────────▼─────────┐          │               │
│         │         │  Search Service  │          │               │
│         │         └────────┬─────────┘          │               │
│         │                  │                     │               │
│  ┌──────▼──────────────────▼─────────────────────▼───────────┐ │
│  │            Document Service                                │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
└────────────────────────────┬┼─────────────────────────────────┘
                             ││
                  ┌──────────▼▼─────────┐
                  │   Ollama API        │
                  │  • mxbai-embed-large   │
                  │  • gemma3:4b      │
                  └─────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    DATA LAYER                                    │
│              PostgreSQL + pgvector                               │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐         │
│  │ documents  │  │ embeddings  │  │   qa_history     │         │
│  │  table     │  │   table     │  │     table        │         │
│  └────────────┘  └─────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                   DATA INGESTION PIPELINE                        │
│               (One-time/Batch Processing)                        │
│  ┌────────┐  ┌───────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  PDFs  │─▶│PDF Parser │─▶│  Chunker │─▶│   Embedding   │   │
│  │ (data/)│  │           │  │          │  │   Generator   │   │
│  └────────┘  └───────────┘  └──────────┘  └───────┬───────┘   │
│                                                     │            │
│                                                     ▼            │
│                                            Store in Database    │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow: Question Answering

```
1. User enters question
   ↓
2. Frontend sends POST /api/qa/ask
   ↓
3. Backend receives question
   ↓
4. Embedding Service creates question embedding (OpenAI API)
   ↓
5. Search Service performs vector similarity search (PostgreSQL)
   ↓
6. Top 5 relevant document chunks retrieved
   ↓
7. Context built from relevant chunks
   ↓
8. QA Service sends context + question to GPT-4o-mini (OpenAI API)
   ↓
9. AI generates answer
   ↓
10. Answer stored in qa_history table
   ↓
11. Response sent to frontend with answer + sources
   ↓
12. Frontend displays answer and sources
```

## Database Schema

### documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  filename VARCHAR(255),
  filepath TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### embeddings

```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  content TEXT,
  embedding VECTOR(1536),  -- pgvector type
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast vector search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

### qa_history

```sql
CREATE TABLE qa_history (
  id UUID PRIMARY KEY,
  question TEXT,
  question_embedding VECTOR(1536),
  answer TEXT,
  source_chunks JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Component Responsibilities

### Frontend Components

**QuestionInput**

- User input capture
- Form validation
- Loading state management

**AnswerDisplay**

- Display Q&A pair
- Show source chunks
- Format response

**HistoryPanel**

- List recent questions
- Navigate to previous Q&A
- Scrollable interface

### Backend Modules

**EmbeddingModule**

- Create embeddings via OpenAI API
- Batch processing support
- Error handling

**DocumentModule**

- Store document metadata
- Store embeddings with content
- Query documents

**QAModule**

- Receive questions from frontend
- Orchestrate embedding + search + generation
- Store Q&A history
- Return formatted responses

### Services

**EmbeddingService**

- Interface with OpenAI embeddings API
- Handle single and batch requests
- Error handling and retries

**DocumentService**

- CRUD operations for documents
- CRUD operations for embeddings
- Database transactions

**QAService**

- Question processing pipeline
- Vector similarity search
- LLM answer generation
- History storage

## Data Flow: Document Ingestion

```
1. Read PDF from data/ folder
   ↓
2. Extract text using pdf-parse
   ↓
3. Clean and normalize text
   ↓
4. Split into chunks (~1000 chars)
   ↓
5. For each chunk:
   a. Create embedding (OpenAI)
   b. Store in embeddings table
   ↓
6. Store document metadata in documents table
   ↓
7. Link embeddings to document via foreign key
```

## Technology Decisions

### Why NestJS?

- TypeScript-first framework
- Excellent dependency injection
- Built-in TypeORM support
- Modular architecture
- Enterprise-ready

### Why pgvector?

- Native PostgreSQL extension
- Fast similarity search
- Supports cosine distance
- No separate vector DB needed
- Simplified architecture

### Why Ollama?

- Open-source, local LLM
- mxbai-embed-large: cost-effective, 1536 dims
- gemma3:4b: fast and affordable
- text-embedding-3-small: cost-effective, 1536 dims

### Why React + Vite?

- Fast development
- Hot module replacement
- TypeScript support
- Modern build tool
- Excellent DX

## Performance Characteristics

**Embedding Creation**

- ~0.5s per chunk
- Batched in groups of 10
- One-time cost per document

**Vector Search**

- <100ms for similarity search
- Indexed with ivfflat
- Top 5 results retrieved

**Answer Generation**

- 2-5 seconds per question
- Depends on context size
- gpt-4o-mini optimized for speed

**End-to-End Latency**

- Question → Answer: 3-6 seconds
- Depends on OpenAI API response time
- Cached embeddings speed up search

## Scalability Considerations

**Current Design** (Small to Medium Scale)

- Single PostgreSQL instance
- Synchronous request processing
- Suitable for: <1000 documents, <100 concurrent users

**Future Enhancements** (Large Scale)

- Redis caching layer
- Message queue for ingestion (Bull/RabbitMQ)
- Connection pooling
- Rate limiting
- Load balancing
- Separate read/write databases
- Horizontal scaling with Kubernetes

## Security Considerations

**Current Implementation**

- CORS enabled for localhost
- No authentication (MVP)
- API keys in environment variables

**Production Requirements**

- JWT authentication
- API rate limiting
- Input sanitization
- SQL injection prevention (using TypeORM)
- HTTPS/TLS
- API key rotation
- Logging and monitoring
