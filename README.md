# Job Application Tracker

A full-stack MERN application to track job applications during the internship/job search process, powered by AI for resume writing, interview prep, and smart search.

##  Live Demo

- **Frontend**: https://job-tracker-inky-eta.vercel.app/
- **Backend API**: https://job-tracker-backend-c4li.onrender.com

##  Features

- User Authentication with JWT
- Dashboard with application summary, progress metrics, and actionable insights
- Add, edit, and delete job applications
- Status tracking (Applied → Interview → Offer/Rejected)
- Store company details, salary, job URL, and notes
- AI-powered resume bullet generator, interview prep guide, question predictor, and application advice
- Smart search across saved applications (semantic vector search + keyword fallback)
- RAG pipeline with Pinecone vector database for semantic job search
- Analytics dashboard with conversion rates, response time, and stale application alerts
- Security hardened with helmet, rate limiting, input validation, and bcrypt
- Responsive design

##  Tech Stack

**Frontend:** React.js, Axios, CSS3
**Backend:** Node.js, Express.js, MongoDB, JWT, bcryptjs
**AI:** Hugging Face Inference API (Qwen/Qwen2.5-7B-Instruct)
**Vector DB:** Pinecone (semantic search with sentence-transformers/all-MiniLM-L6-v2)
**Security:** helmet, express-rate-limit, compression

##  Installation

### Backend Setup
```bash
cd backend
npm install
# Create .env file with the following variables:
# MONGODB_URI, JWT_SECRET, PORT
# HF_API_KEY       — Hugging Face API key (enables real AI responses)
# PINECONE_API_KEY — Pinecone API key (enables semantic search)
# PINECONE_INDEX_NAME=job-tracker
# FRONTEND_URL     — your frontend URL for CORS
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

##  API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/jobs/ | All jobs (user-scoped) |
| GET | /api/jobs/stats/summary | Count stats |
| GET | /api/jobs/:id | Single job |
| POST | /api/jobs/ | Create job |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |
| GET | /api/analytics/health/:jobId | Health score |
| GET | /api/analytics/velocity | Pipeline velocity |
| GET | /api/analytics/insights | Actionable insights |
| GET | /api/analytics/predict/:jobId | Offer probability |
| POST | /api/ai/resume-bullets | AI resume bullets |
| POST | /api/ai/interview-prep | AI interview guide |
| POST | /api/ai/questions | AI interview questions |
| POST | /api/ai/advice | AI application advice |
| POST | /api/ai/search | Semantic search |

##  What I Learned

- Full-stack MERN development
- JWT authentication and security hardening
- RESTful API design with 17 endpoints
- React Hooks for state management
- MongoDB database design and aggregation
- Hugging Face Inference API integration
- RAG pipeline with vector embeddings and Pinecone
- Semantic search with fallback strategies
- Deployment with Render and Vercel

##  Author

**Ekta**
- GitHub: [@ektasinghyadav](https://github.com/ektasinghyadav)
- LinkedIn: [Ekta Singh Yadav](https://www.linkedin.com/in/ektasinghyadav/)

---

Made with ❤️ by Ekta
