# OJ Codester

A full-stack competitive programming platform for algorithm practice, coding contests, and skill development.

**Live**  [codester.vercel.app](https://codester.vercel.app)

---

## Overview

OJ Codester is a web-based online judge that supports multi-language code execution, contest hosting, AI-powered hints, and a community discussion board. It is designed with a clean dark-first UI and built for deployment on modern cloud infrastructure.

---

## Features

| Area | Details |
|---|---|
| **Code Execution** | Python, JavaScript, Java, C++, C via a sandboxed compiler service |
| **Problem Library** | Curated algorithmic challenges across Easy / Medium / Hard difficulty |
| **AI Assistance** | Code hints and reviews via Google Gemini |
| **Contests** | Timed competitive rounds with leaderboard rankings |
| **Discussions** | Community forums per problem and general topics |
| **User Profiles** | Progress tracking, submission history, statistics |
| **Admin Panel** | Problem management, user management, platform settings |
| **Code Runner** | Standalone IDE with custom test cases |

---

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Monaco Editor, Framer Motion, React Router  
**Backend** — Node.js, Express, MongoDB Atlas, Redis, JWT, Google Gemini AI  
**Compiler** — Isolated Python service containerized via Docker  
**Infra** — Vercel (frontend), Render (backend), Azure Container Instances (compiler)

---

## Project Structure

```
Online-Judge-Codester/
 frontend/               # React + Vite app
    src/
       components/     # Navbar, Footer, CodeEditor
       pages/          # All route-level pages
       context/        # Auth, Theme providers
       services/       # API clients
       utils/
    public/
 backend/
    server/             # Express API
        models/         # Mongoose schemas
        middleware/     # Auth middleware
        services/       # Business logic, AI, evaluation
 compiler-service/       # Sandboxed code execution service
    compiler.py
    Dockerfile
 docs/                   # Deployment and implementation guides
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Redis Cloud account (optional — falls back to in-memory)
- Google Gemini API key (optional — AI features disabled without it)

### 1. Clone

```bash
git clone https://github.com/ark5234/Online-Judge-Codester.git
cd Online-Judge-Codester
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend

```bash
cd backend/server
npm install
cp .env.example .env   # fill in your values
npm start
```

### Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=https://online-judge-codester.onrender.com/api
VITE_COMPILER_URL=http://your-compiler-service-url
```

**Backend** (`backend/server/.env`):
```env
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_cloud_url
JWT_SECRET=your_jwt_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
COMPILER_SERVICE_URL=http://your-compiler-service-url
CORS_ORIGIN=https://codester.vercel.app
```

---

## Deployment

See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for full deployment instructions for Render, Vercel, and Azure.

**Quick reference:**
- **Frontend**  Connect repo to Vercel, set env vars, push to `main`
- **Backend**  Connect repo to Render, set env vars, push to `main`
- **Compiler**  Build Docker image, deploy to any container host (Azure, Render, Fly.io)

---

## Supported Languages

Python 3.10+  JavaScript (Node.js)  Java (OpenJDK 11)  C++ (GCC)  C (GCC)

---

## Notes

- **Cookie policy** — If third-party cookies are blocked, Google OAuth may fail. Use email/password login as a fallback.
- **Compiler timeouts** — Submissions have a max execution time. Avoid interactive/infinite-loop programs.
- **Secrets** — Never commit `.env` files. Use environment variable managers in production.
- **AI hints** — Treat AI suggestions as guidance, not ground truth. Always verify with test cases.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: describe your change'`
4. Push and open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE).
