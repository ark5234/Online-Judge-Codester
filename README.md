# Online Judge - Codester

A modern, full-stack online coding platform designed for competitive programming, algorithm practice, and coding interviews. Built with cutting-edge technologies and deployed on cloud infrastructure.

## Features

- **Multi-Language Code Execution**: Support for Python, JavaScript, Java, C++, and C
- **Comprehensive Problem Library**: Curated algorithmic challenges across multiple difficulty levels
- **AI-Powered Code Assistance**: Intelligent hints and code reviews powered by Google Gemini AI
- **Complete User Management**: Secure authentication, user profiles, and progress tracking
- **Advanced Analytics**: Detailed submission statistics and performance metrics
- **Community Features**: Discussion forums for problem-solving and knowledge sharing
- **Modern Responsive UI**: Beautiful interface built with React 19 and Tailwind CSS
- **Real-time Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- **Secure Architecture**: JWT-based authentication with comprehensive middleware protection

## Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor for the web
- **React Router Dom** - Declarative routing
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful & consistent icons

### Backend

- **Node.js & Express** - Server-side JavaScript runtime and framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Redis Cloud** - In-memory caching and session storage
- **JWT** - Stateless authentication tokens
- **Google Gemini AI** - Advanced AI code assistance
- **Appwrite** - Backend-as-a-Service for additional features

### Infrastructure & Deployment

- **Frontend**: Vercel (Global CDN, automatic deployments)
- **Backend**: Render (Auto-scaling, continuous deployment)
- **Compiler Service**: Azure Container Instances (Isolated code execution)
- **Database**: MongoDB Atlas (Multi-region clusters)
- **Cache**: Redis Cloud (High-performance caching)

## Live Demo

- **Frontend**: <https://codester.vercel.app>
- **Backend API**: <https://online-judge-codester.onrender.com>
- **Compiler Service**: <http://4.187.155.173:80>

## Prerequisites

- **Node.js 18+** - JavaScript runtime
- **MongoDB Atlas Account** - Cloud database service
- **Redis Cloud Account** - Caching service
- **Azure Account** - For compiler service hosting
- **Google Gemini API Key** - For AI assistance (optional)
- **Git** - Version control

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ark5234/Online-Judge-Codester.git
cd Online-Judge-Codester
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend/server
npm install
npm start
```

### 4. Environment Variables

#### Frontend (.env.local)

```env
VITE_API_URL=https://online-judge-codester.onrender.com/api
VITE_COMPILER_URL=http://4.187.155.173:80
```

#### Backend (.env)

```env
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_cloud_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
COMPILER_SERVICE_URL=http://4.187.155.173:80
CORS_ORIGIN=https://codester.vercel.app
```

##  Important Notes & Warnings

- Third‑party cookies: If your browser blocks third‑party cookies, Appwrite cookie sessions may fail. The app includes a cookie‑less fallback for manual email/password login via backend JWT. Google OAuth may still rely on cookies unless configured with a token exchange.
- Compiler timeouts: Long‑running or highly interactive programs may time out. Prefer printing final answers. Memory/CPU are limited in the remote sandbox.
- Hidden problems in v1.0: Some problems may be intentionally hidden from the Problems list for the initial release (e.g., Word Ladder). Existing backend/data routes still work; UI only hides them.
- CORS/domains: Ensure frontend and backend origins are added to CORS allowed origins and that environment variables match your deployed URLs.
- Security: Do not commit secrets. Use environment variables or secret managers (e.g., Azure Key Vault) for tokens and keys.

##  Suggestions for Users

- Prefer using the Code Runner’s test cases panel to iterate on logic with custom inputs and expected outputs.
- For Java solutions, ensure your entry class is `Main` if running raw code in the Code Runner.
- For linked list problems, follow the input format shown in each problem description to avoid parsing mismatches.
- Save your work frequently; the editor auto‑saves, but manual save is available in the UI.

## Supported Languages

- **Python** (3.10+)
- **JavaScript** (Node.js)
- **Java** (OpenJDK 11)
- **C++** (GCC)
- **C** (GCC)

## Problem Categories

- **Arrays & Strings**
- **Linked Lists**
- **Trees & Graphs**
- **Dynamic Programming**
- **Greedy Algorithms**
- **Sorting & Searching**
- **Mathematics**
- **Bit Manipulation**

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Compiler Service (Azure Container Instances)

1. Create Azure resource group in your preferred region
2. Deploy containerized compiler service using Azure CLI
3. Configure public IP and port access
4. Update backend environment variables with new service URL

## Project Structure

```plaintext
Online-Judge-Codester/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── services/       # API service layers
│   │   ├── context/        # React context providers
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/
│   └── server/             # Express.js backend
│       ├── models/         # MongoDB data models
│       ├── middleware/     # Express middleware
│       ├── services/       # Business logic services
│       └── package.json    # Backend dependencies
├── compiler-service/       # Isolated code execution service
│   ├── compiler.py         # Python-based code executor
│   └── Dockerfile          # Container configuration
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor for the web
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Google Gemini AI](https://ai.google.dev/) - Advanced AI assistance
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Cloud database platform
- [Render](https://render.com/) - Backend hosting platform
- [Vercel](https://vercel.com/) - Frontend hosting and deployment
- [Azure](https://azure.microsoft.com/) - Compiler service hosting

## Support

If you have any questions or need help, please:

-  Open an issue on [GitHub Issues](https://github.com/ark5234/Online-Judge-Codester/issues)
-  Contact the development team
-  Check the documentation above

## Roadmap

- [ ] Contest management system
- [ ] Real-time leaderboards
- [ ] Advanced problem filtering
- [ ] Code plagiarism detection
- [ ] Mobile application
- [ ] Integration with external judges

---

### Made with ❤️ by the Codester Team

