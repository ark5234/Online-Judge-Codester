# OJ Codester

A modern, full-stack online judge platform for competitive programming, algorithm practice, and coding interviews — built with React, Node.js, and cloud-native infrastructure.

**Live Demo**  [codester.vercel.app](https://codester.vercel.app) &nbsp;|&nbsp; **Backend API**  [online-judge-codester.onrender.com](https://online-judge-codester.onrender.com)

---

## Features

- **Multi-Language Code Execution** — Python, JavaScript, Java, C++, C via an isolated sandboxed compiler service
- **Comprehensive Problem Library** — Curated algorithmic challenges across Easy, Medium, and Hard difficulty
- **AI-Powered Code Assistance** — Intelligent hints and code reviews powered by Google Gemini AI
- **Coding Contests** — Timed competitive rounds with live leaderboards
- **Community Discussions** — Per-problem and general discussion forums
- **User Profiles & Progress** — Submission history, analytics, and performance metrics
- **Admin Dashboard** — Full problem and user management interface
- **Real-time Code Editor** — Monaco Editor (VS Code engine) with syntax highlighting and IntelliSense
- **Code Runner** — Standalone IDE with custom input/output test cases
- **Secure Authentication** — JWT-based auth with Redis session caching and optional Google OAuth

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 19 | UI framework with concurrent features |
| Vite | Lightning-fast build tooling |
| Tailwind CSS v4 | Utility-first styling |
| Monaco Editor | VS Code editor for the web |
| React Router Dom | Client-side routing |
| Framer Motion | Animations and transitions |
| React Icons | Icon library |

### Backend
| Library / Service | Purpose |
|---|---|
| Node.js & Express | REST API server |
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Redis Cloud | In-memory caching and session storage |
| JWT | Stateless authentication tokens |
| Google Gemini AI | AI code hints and reviews |
| Appwrite | BaaS for OAuth and file storage |

### Infrastructure
| Service | Role |
|---|---|
| Vercel | Frontend hosting (global CDN, auto-deploy) |
| Render | Backend hosting (auto-scaling, continuous deploy) |
| Azure Container Instances | Isolated compiler service execution |
| MongoDB Atlas | Multi-region database clusters |
| Redis Cloud | High-performance distributed cache |

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | https://codester.vercel.app |
| Backend API | https://online-judge-codester.onrender.com |

---

## Project Structure

```
Online-Judge-Codester/
 frontend/                    # React 19 + Vite application
    src/
       components/          # Navbar, Footer, CodeEditor
       pages/               # Route-level page components
       context/             # Auth, Theme context providers
       services/            # API client functions (Appwrite, auth, admin)
       utils/               # Shared utility functions
    public/                  # Static assets (favicon, etc.)
    index.html
    package.json
 backend/
    server/                  # Express.js REST API
        models/              # Mongoose schemas (User, Problem, Submission)
        middleware/          # Auth guard, rate limiting
        services/            # Evaluation, AI, JS compiler services
        production-server.js # Entrypoint
        package.json
 compiler-service/            # Sandboxed code execution microservice
    compiler.py              # Python-based multi-language executor
    Dockerfile
    requirements.txt
 docs/                        # Deployment and reference guides
```

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB Atlas** account
- **Redis Cloud** account *(optional — app falls back to in-memory cache)*
- **Google Gemini API Key** *(optional — AI features disabled without it)*
- **Git**

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
#  http://localhost:5173
```

### 3. Backend

```bash
cd backend/server
npm install
cp .env.example .env   # edit with your values
npm start
#  http://localhost:10000
```

### 4. Compiler Service *(optional for local dev)*

```bash
cd compiler-service
pip install -r requirements.txt
python compiler.py
#  http://localhost:8000
```

---

## Environment Variables

### Frontend — `frontend/.env.local`

```env
VITE_API_URL=https://online-judge-codester.onrender.com/api
VITE_COMPILER_URL=http://localhost:8000
```

### Backend — `backend/server/.env`

```env
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
REDIS_URL=your_redis_cloud_url
JWT_SECRET=your_jwt_secret_at_least_32_chars
GEMINI_API_KEY=your_google_gemini_api_key
COMPILER_SERVICE_URL=http://your-compiler-service-url
CORS_ORIGIN=https://codester.vercel.app
```

---

## Deployment

Full step-by-step instructions are in [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

### Frontend  Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set the environment variables in the Vercel dashboard
3. Every push to `main` triggers an automatic deployment

### Backend  Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Set the environment variables in the Render dashboard
3. Every push to `main` triggers an automatic deployment

### Compiler Service  Azure Container Instances
1. Build the Docker image: `docker build -t oj-compiler ./compiler-service`
2. Push to Azure Container Registry
3. Deploy via Azure CLI or the Azure portal
4. Update `COMPILER_SERVICE_URL` in your backend env vars

> **Note:** Azure Container Instances assign a new public IP on each restart. See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for setting up a stable URL using Render or Fly.io as an alternative host.

---

## Supported Languages

| Language | Runtime |
|---|---|
| Python | 3.10+ |
| JavaScript | Node.js (LTS) |
| Java | OpenJDK 11 |
| C++ | GCC |
| C | GCC |

---

## Problem Categories

- Arrays & Strings
- Linked Lists
- Trees & Graphs
- Dynamic Programming
- Greedy Algorithms
- Sorting & Searching
- Mathematics
- Bit Manipulation

---

## Usage Tips

- Use the **Code Runner** test cases panel to iterate quickly with custom inputs before submitting.
- For **Java**, your entry class must be named `Main` when using the Code Runner.
- For **linked list** problems, follow the exact input format described in each problem to avoid parsing errors.
- The editor auto-saves your code in local storage — manual save is also available in the toolbar.
- If **Google OAuth** fails, check your browser's third-party cookie settings and use email/password as a fallback.

---

## Important Notes

- **Third-party cookies** — Appwrite OAuth sessions depend on cookies. If blocked, the app uses a cookie-less JWT fallback for email/password login.
- **Compiler timeouts** — Submissions have a hard time and memory limit. Avoid infinite loops or heavy I/O-bound programs.
- **CORS** — Ensure both frontend and backend URLs are added to `CORS_ORIGIN` in your environment config.
- **Secrets** — Never commit `.env` files. Use secret managers (e.g., Azure Key Vault, Render Secrets) in production.
- **AI hints** — Gemini responses are guidance only. Always verify logic with your own test cases.

---

## Roadmap

- [ ] Real-time contest leaderboards (WebSocket)
- [ ] Code plagiarism detection
- [ ] Advanced problem filtering and tags
- [ ] Editorial / official solutions per problem
- [ ] Mobile-responsive code editor improvements
- [ ] Integration with external judges (Codeforces, SPOJ)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with a clear message: `git commit -m "feat: describe your change"`
4. Push and open a Pull Request against `main`

Please follow existing code style and keep PRs focused on a single concern.

---

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code editor engine
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Google Gemini AI](https://ai.google.dev/) — AI code assistance
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database
- [Render](https://render.com/) — Backend hosting
- [Vercel](https://vercel.com/) — Frontend hosting
- [Azure](https://azure.microsoft.com/) — Compiler service infrastructure

---

## Support

- Open an issue on [GitHub Issues](https://github.com/ark5234/Online-Judge-Codester/issues)
- Start a discussion in the [GitHub Discussions](https://github.com/ark5234/Online-Judge-Codester/discussions) tab

---

## License

MIT — see [LICENSE](LICENSE).

---

*Made with  by the OJ Codester team*
