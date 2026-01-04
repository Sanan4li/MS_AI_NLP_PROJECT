---
name: QA System Architecture
overview: Create an architecture diagram for a document-based Question-Answer system using OpenAI embeddings, PostgreSQL with pgvector, NestJS backend, and React frontend.
todos: []
---

# QA System Architecture Diagram

## System Overview

A Retrieval-Augmented Generation (RAG) based question-answer system that uses your PDF documents as a knowledge base.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph DataIngestion [Data Ingestion Pipeline]
        PDFs["PDF Documents<br/>data/"]
        Parser["PDF Parser"]
        Chunker["Text Chunker"]
        EmbedGen["OpenAI Embeddings<br/>text-embedding-3-small"]
        PDFs --> Parser --> Chunker --> EmbedGen
    end

    subgraph Database [PostgreSQL + pgvector]
        DocTable["documents table"]
        EmbedTable["embeddings table<br/>with vector column"]
        QATable["qa_history table"]
    end

    subgraph Backend [NestJS Backend]
        API["REST API"]
        EmbedService["Embedding Service"]
        SearchService["Vector Search Service"]
        LLMService["LLM Service<br/>Ollama gemma3:4b"]
    end

    subgraph Frontend [React Frontend]
        UI["Question Input UI"]
        Display["Answer Display"]
    end

    EmbedGen -->|"Store embeddings"| EmbedTable
    Parser -->|"Store metadata"| DocTable

    UI -->|"POST /api/ask"| API
    API --> EmbedService
    EmbedService -->|"Create question embedding"| SearchService
    SearchService -->|"Vector similarity search"| EmbedTable
    SearchService -->|"Relevant chunks"| LLMService
    LLMService -->|"Generate answer"| API
    API -->|"Store Q&A"| QATable
    API -->|"Return answer"| Display
```

## Component Details

### 1. Data Ingestion Pipeline (One-time/Batch Process)

- **PDF Parser**: Extract text from PDFs in `data/` folder
- **Text Chunker**: Split documents into smaller chunks (500-1000 tokens each)
- **Embedding Generator**: Convert chunks to vectors using `text-embedding-3-small`

### 2. Database Schema (PostgreSQL + pgvector)

```mermaid
erDiagram
    documents {
        uuid id PK
        string filename
        string filepath
        timestamp created_at
    }

    embeddings {
        uuid id PK
        uuid document_id FK
        text content
        vector embedding
        int chunk_index
        timestamp created_at
    }

    qa_history {
        uuid id PK
        text question
        vector question_embedding
        text answer
        json source_chunks
        timestamp created_at
    }

    documents ||--o{ embeddings : contains
```

### 3. Question-Answer Flow

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant NestJS as NestJS Backend
    participant OpenAI as OpenAI API
    participant Ollama as Ollama Local
    participant PG as PostgreSQL

    User->>React: Enter question
    React->>NestJS: POST /api/ask
    NestJS->>OpenAI: Create embedding for question
    OpenAI-->>NestJS: Question vector
    NestJS->>PG: Vector similarity search
    PG-->>NestJS: Top K relevant chunks
    NestJS->>Ollama: Send context + question to gemma3:4b
    Ollama-->>NestJS: Generated answer
    NestJS->>PG: Store Q&A in qa_history
    NestJS-->>React: Return answer + sources
    React-->>User: Display answer
```

## Project Structure

```javascript
NLP_Project/
├── data/                    # PDF documents
├── backend/                 # NestJS API
│   └── src/
│       ├── modules/
│       │   ├── embedding/   # Embedding generation & search
│       │   ├── document/    # Document ingestion
│       │   └── qa/          # Question-answer endpoint
│       └── database/        # TypeORM entities & migrations
├── frontend/                # React UI
│   └── src/
│       ├── components/      # UI components
│       └── services/        # API calls
└── scripts/                 # Data ingestion scripts
```

## Key Technologies

| Component | Technology ||-----------|------------|| Frontend | React + TypeScript + Vite || Backend | NestJS + TypeORM || Database | PostgreSQL + pgvector || Embeddings | OpenAI text-embedding-3-small || LLM | Ollama gemma3:4b (local) |
