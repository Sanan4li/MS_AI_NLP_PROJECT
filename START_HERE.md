# 🚀 START HERE

Welcome to your Document Q&A System! This guide will get you started quickly.

## ✨ What You Have

A complete, production-ready AI-powered Q&A system that:
- Reads your PDF documents
- Creates semantic embeddings using OpenAI
- Answers questions based on document content
- Shows sources for every answer
- Stores Q&A history

## 📋 Prerequisites Needed

Before starting, make sure you have:
1. **PostgreSQL** installed with **pgvector** extension
2. **Node.js** v18 or higher
3. **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))

## 🎯 Quick Start (5 Steps - 10 minutes)

### Step 1: Setup Database
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# or: sudo systemctl start postgresql  # Linux

# Create database
psql -U postgres -c "CREATE DATABASE qa_system;"
psql -U postgres -d qa_system -c "CREATE EXTENSION vector;"
```

### Step 2: Configure Backend
Create `backend/.env` file:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=qa_system
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

**⚠️ IMPORTANT:** Replace with your actual values!

### Step 3: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4: Process Your Documents
```bash
cd backend
npm run ingest
```

Wait for it to complete (shows progress for each PDF).

### Step 5: Start the System
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

## 🎉 You're Ready!

Open http://localhost:5173 in your browser and ask questions like:
- "What is machine learning?"
- "Explain cloud computing"
- "What are the key concepts in data science?"

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](README.md)** | Comprehensive overview and usage |
| **[QUICKSTART.md](QUICKSTART.md)** | Detailed setup instructions |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design and technical details |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment guide |
| **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** | Verify your installation |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | What was built |

## 🔍 Project Structure

```
NLP_Project/
├── backend/           # NestJS API server
├── frontend/          # React UI
├── data/             # Your PDF documents (add more here!)
└── *.md              # Documentation files
```

## 🛠️ Common Commands

### Backend
```bash
cd backend
npm run start:dev     # Start development server
npm run build         # Build for production
npm run ingest        # Process new documents
```

### Frontend
```bash
cd frontend
npm run dev           # Start development server
npm run build         # Build for production
```

## ❓ Need Help?

### "Cannot connect to database"
- Check PostgreSQL is running: `brew services list`
- Verify credentials in `backend/.env`

### "pgvector extension not found"
```bash
brew install pgvector
psql -U postgres -d qa_system -c "CREATE EXTENSION vector;"
```

### "OpenAI API error"
- Verify API key in `backend/.env`
- Check your OpenAI account has credits

### Frontend can't reach backend
- Ensure backend is running on port 3000
- Check browser console for errors

## 🎨 Customization

### Add More Documents
1. Place PDF files in `data/` folder
2. Run `npm run ingest` in backend
3. Start asking questions about new content!

### Change UI Colors
Edit `frontend/src/App.css` - look for gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modify Chunk Size
Edit `backend/src/scripts/ingest-documents.ts`:
```typescript
const chunks = await chunkText(text, 1000); // Change 1000 to your size
```

## 🚀 Next Steps

1. ✅ Get the system running (follow steps above)
2. ✅ Ask your first questions
3. ✅ Review the documentation
4. ✅ Add your own PDF documents
5. ✅ Deploy to production (see DEPLOYMENT.md)

## 📊 System Status Check

To verify everything is working:

```bash
# Check backend
curl http://localhost:3000/api/qa/history

# Check database
psql -U postgres -d qa_system -c "SELECT COUNT(*) FROM documents;"

# Check frontend
# Just open http://localhost:5173 in browser
```

## 💡 Tips

- **First time?** Follow [QUICKSTART.md](QUICKSTART.md) for detailed steps
- **Problems?** Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) to diagnose
- **Understanding the code?** Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Going to production?** Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## 📞 Support Resources

- NestJS: https://docs.nestjs.com/
- React: https://react.dev/
- pgvector: https://github.com/pgvector/pgvector
- OpenAI: https://platform.openai.com/docs

---

**Ready to start?** Run the 5 steps above and you'll be asking questions in 10 minutes! 🎉

For the full experience, read [README.md](README.md) for comprehensive documentation.

