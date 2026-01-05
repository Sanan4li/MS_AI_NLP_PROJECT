# Setup Verification Checklist

Use this checklist to ensure your Document Q&A system is properly configured.

## ✅ Prerequisites

- [ ] Node.js v22+ installed (`node --version`)
- [ ] PostgreSQL installed (`psql --version`)
- [ ] pgvector extension available
- [ ] OpenAI API key obtained

## ✅ Database Setup

- [ ] PostgreSQL service is running
- [ ] Database `qa_system` created
- [ ] pgvector extension enabled (`\dx` in psql should show `vector`)
- [ ] Can connect to database (`psql -U postgres -d qa_system`)

**Verify:**

```bash
psql -U postgres -d qa_system -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

Should return one row with extension details.

## ✅ Backend Configuration

- [ ] Backend dependencies installed (`backend/node_modules/` exists)
- [ ] `.env` file created in `backend/` directory
- [ ] Database credentials set in `.env`
- [ ] OpenAI API key set in `.env`
- [ ] Port 3000 is available

**Verify:**

```bash
cd backend
cat .env | grep -E "(DATABASE|OPENAI|PORT)"
```

Should show all your configuration values.

## ✅ Frontend Configuration

- [ ] Frontend dependencies installed (`frontend/node_modules/` exists)
- [ ] Can access port 5173
- [ ] API URL configured (default: localhost:3000)

**Verify:**

```bash
cd frontend
npm list axios
```

Should show axios installed.

## ✅ Documents Ready

- [ ] PDF files exist in `data/` folder
- [ ] At least one PDF document available
- [ ] PDFs are readable (not encrypted/password-protected)

**Verify:**

```bash
ls -lh data/*.pdf
```

Should list your PDF files.

## ✅ Data Ingestion

- [ ] Ingestion script exists (`backend/src/scripts/ingest-documents.ts`)
- [ ] Can run `npm run ingest` without errors
- [ ] Documents processed and stored in database

**Verify:**

```bash
cd backend
npm run ingest
```

Should see output like:

```
Found X PDF files to process
Processing: /path/to/data/your_document.pdf
Extracted X characters from PDF
Created Y chunks
✓ Successfully processed your_document.pdf
```

**Then check database:**

```bash
psql -U postgres -d qa_system -c "SELECT COUNT(*) FROM documents;"
psql -U postgres -d qa_system -c "SELECT COUNT(*) FROM embeddings;"
```

Should show your documents and embeddings.

## ✅ Backend Running

- [ ] Backend starts without errors
- [ ] Backend accessible at http://localhost:3000
- [ ] Can see console message: "Application is running on: http://localhost:3000"

**Verify:**

```bash
cd backend
npm run start:dev
```

In another terminal:

```bash
curl http://localhost:3000/api/qa/history
```

Should return JSON with `{"success":true,"history":[]}` or similar.

## ✅ Frontend Running

- [ ] Frontend starts without errors
- [ ] Frontend accessible at http://localhost:5173
- [ ] Page loads in browser
- [ ] No console errors in browser DevTools

**Verify:**

```bash
cd frontend
npm run dev
```

Open browser to http://localhost:5173 - should see the UI.

## ✅ End-to-End Test

- [ ] Can type a question in the UI
- [ ] Click "Ask" button works
- [ ] Loading spinner appears
- [ ] Answer appears within 10 seconds
- [ ] Sources are displayed
- [ ] Question appears in history panel

**Test Questions:**

1. "What is machine learning?"
2. "Explain cloud computing"
3. "What are the key concepts in data science?"

## ✅ Database Verification

**Check tables created:**

```sql
psql -U postgres -d qa_system

-- Should see 3 tables
\dt

-- Check data
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM embeddings;
SELECT COUNT(*) FROM qa_history;
```

**Expected:**

- `documents`: Number of PDFs you ingested
- `embeddings`: Hundreds to thousands (depending on PDF size)
- `qa_history`: Increases with each question

## Common Issues & Solutions

### ❌ "Cannot connect to database"

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Restart if needed
brew services restart postgresql
```

### ❌ "pgvector extension not found"

```bash
# Install pgvector
brew install pgvector

# Enable in database
psql -U postgres -d qa_system -c "CREATE EXTENSION vector;"
```

### ❌ "OpenAI API error"

```bash
# Verify API key
cd backend
node -e "console.log(require('dotenv').config()); console.log(process.env.OPENAI_API_KEY)"

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### ❌ "Frontend can't reach backend"

- Check backend is running on port 3000
- Check for CORS errors in browser console
- Verify `src/services/api.ts` has correct URL

### ❌ "Ingestion fails"

- Check PDF files are valid
- Check OpenAI API has credits
- Check database connection
- Check disk space

## Performance Checks

### Response Time

- Question to answer should be 3-6 seconds
- If slower, check:
  - OpenAI API response time
  - Database query performance
  - Network latency

### Database Queries

```sql
-- Check embedding distribution
SELECT document_id, COUNT(*)
FROM embeddings
GROUP BY document_id;

-- Check recent questions
SELECT question, created_at
FROM qa_history
ORDER BY created_at DESC
LIMIT 5;
```

## System Resources

Monitor during operation:

**CPU**: Should be low (<20%) when idle
**Memory**:

- Backend: ~100-300MB
- Frontend: ~50-100MB
- PostgreSQL: ~100-500MB

**Disk**:

- Database size: Check with `\l+` in psql
- Typical: 10-100MB per 100 pages of PDFs

## Final Verification

Run this complete test:

```bash
# Terminal 1: Start backend
cd backend && npm run start:dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Test API
curl -X POST http://localhost:3000/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is machine learning?"}'

# Should return JSON with answer and sources
```

## Success! 🎉

If all checks pass:

- ✅ System is properly configured
- ✅ Ready to use
- ✅ Can ask questions about your documents

## Next Steps

1. Add more documents to `data/` folder
2. Re-run `npm run ingest` to process new documents
3. Customize the UI in `frontend/src/`
4. Add authentication (see ARCHITECTURE.md)
5. Deploy to production (see DEPLOYMENT.md)

---

**Need Help?**

- Check [README.md](README.md) for detailed documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [QUICKSTART.md](QUICKSTART.md) for rapid setup
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
