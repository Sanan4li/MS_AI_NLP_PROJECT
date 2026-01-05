# Quick Start Guide

Get your Document Q&A system up and running in 5 steps!

## Step 1: Setup Database (2 minutes)

```bash
# Make sure PostgreSQL is running
brew services start postgresql

# Create database and enable pgvector
psql -U postgres << EOF
CREATE DATABASE qa_system;
\c qa_system
CREATE EXTENSION IF NOT EXISTS vector;
EOF
```

## Step 2: Configure Backend (1 minute)

Create `backend/.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=qa_system
OPENAI_API_KEY=sk-your-api-key-here
PORT=3000
```

**Important**: Replace `your_password` and `sk-your-api-key-here` with your actual values!

## Step 3: Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 4: Ingest Documents (5-10 minutes)

```bash
cd backend
npm run ingest
```

This processes your PDF documents and creates embeddings. Wait for it to complete!

## Step 5: Start the System

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## You're Ready! 🎉

Open http://localhost:5173 and ask your first question!

### Example Questions to Try:

- "What is machine learning?"
- "Explain cloud computing"
- "What are the benefits of web development?"
- "Tell me about data science"

---

## Troubleshooting

### "Cannot find module 'pdf-parse'"
```bash
cd backend && npm install
```

### "Connection refused" in frontend
- Make sure backend is running on port 3000
- Check `backend/.env` configuration

### "OpenAI API error"
- Verify your API key in `backend/.env`
- Check your OpenAI account has credits

### "pgvector extension not found"
```bash
brew install pgvector
psql -U postgres -d qa_system -c "CREATE EXTENSION vector;"
```

---

Need more help? Check the main [README.md](README.md) for detailed documentation.



