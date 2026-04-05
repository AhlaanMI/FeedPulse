# FeedPulse — AI-Powered Product Feedback Platform
<img width="1366" height="1042" alt="screencapture-localhost-3000-dashboard-2026-04-05-14_32_55" src="https://github.com/user-attachments/assets/b64f4a34-4691-4596-ae91-94987e85b0cd" />
<img width="1366" height="1132" alt="screencapture-localhost-3000-2026-04-05-14_33_21" src="https://github.com/user-attachments/assets/4895b258-fb82-4e3b-a970-68759a05798f" />

An intelligent feedback collection and analysis platform that uses Google Gemini AI to automatically categorize, prioritize, and summarize product feedback.

## Features

### Core Features (Implemented)

- ✅ **Public Feedback Submission Form** - Clean interface for users to submit feedback without authentication
- ✅ **AI-Powered Analysis** - Google Gemini automatically analyzes feedback for category, sentiment, priority, and summary
- ✅ **Admin Dashboard** - Protected interface for reviewing and managing all feedback
- ✅ **Feedback Filtering & Sorting** - Filter by category, status, priority; sort by date or priority
- ✅ **Status Management** - Update feedback status (New → In Review → Resolved)
- ✅ **Rate Limiting** - Prevent spam by limiting submissions to 5 per IP per hour
- ✅ **Statistics Dashboard** - View total feedback, open items, average priority, and most common tags
- ✅ **Real-time AI Processing** - Asynchronous AI analysis for instant feedback submission

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Modern utility-first CSS framework
- **Axios** - HTTP client for API communication

### Backend

- **Node.js + Express** - Lightweight, fast API server
- **TypeScript** - Type-safe backend code
- **MongoDB + Mongoose** - NoSQL database with schema validation
- **Google Generative AI SDK** - Gemini API integration
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing for security

### Testing & DevOps

- **Jest** - Unit and integration testing framework
- **Supertest** - HTTP assertion library for API testing
- **Docker** - Containerization of frontend and backend
- **Docker Compose** - Orchestration of all services

## Project Structure

```
feedpulse/
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx         # Public feedback submission page
│   │   ├── dashboard/page.tsx # Admin dashboard
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── FeedbackForm.tsx # Feedback form component
│   ├── lib/
│   │   └── api.ts          # API client with auth interceptors
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── models/
│   │   │   ├── Feedback.ts  # Feedback schema
│   │   │   └── User.ts      # User/Admin schema
│   │   ├── controllers/
│   │   │   ├── feedbackController.ts
│   │   │   └── authController.ts
│   │   ├── services/
│   │   │   └── gemini.service.ts # AI integration
│   │   ├── routes/
│   │   │   ├── feedbackRoutes.ts
│   │   │   └── authRoutes.ts
│   │   ├── middleware/
│   │   │   └── auth.ts      # JWT verification
│   │   └── __tests__/       # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── docker-compose.yml        # Service orchestration
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB 5+ (for local development)
- Google Gemini API key (get free at [aistudio.google.com](https://aistudio.google.com))
- Docker & Docker Compose (optional, for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd feedpulse
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your values:
# GEMINI_API_KEY=your-api-key-here
# JWT_SECRET=your-secret-key
# MONGO_URI=mongodb://localhost:27017/feedpulse

# Start MongoDB locally (if not using Docker)
mongod

# Run the backend
npm run dev
```

The backend will start at `http://localhost:4000`

#### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file (optional, defaults to localhost)
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Run the frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

### Docker Deployment

Run the entire stack with a single command:

```bash
# Set environment variables
export GEMINI_API_KEY=your-api-key-here
export JWT_SECRET=your-secret-key

# Start all services
docker-compose up --build
```

Once running:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **MongoDB**: localhost:27017

To stop and clean up:

```bash
docker-compose down -v
```

## Usage

### Submit Feedback

1. Visit **http://localhost:3000**
2. Fill out the feedback form with:
   - **Title** (5-120 characters)
   - **Description** (minimum 20 characters)
   - **Category** (Bug, Feature Request, Improvement, Other)
   - **Name & Email** (optional)
3. Click "Submit Feedback"
4. The AI automatically analyzes your feedback and saves results

### Admin Dashboard

1. Visit **http://localhost:3000/dashboard**
2. Log in with default credentials:
   - **Email**: `admin@feedpulse.com`
   - **Password**: `admin123456`
3. View all feedback with:
   - Filter by category or status
   - Sort by date or priority
   - Search by title or summary
   - Update feedback status
   - View AI-generated insights

## API Endpoints

### Public Endpoints

- `POST /api/feedback` - Submit new feedback
- `GET /api/feedback/stats` - Get dashboard statistics

### Protected Endpoints (Require JWT Token)

- `GET /api/feedback` - Get all feedback (with filters & pagination)
- `GET /api/feedback/:id` - Get single feedback item
- `PATCH /api/feedback/:id` - Update feedback status
- `DELETE /api/feedback/:id` - Delete feedback
- `GET /api/feedback/summary/generate` - Generate AI summary of feedback

### Authentication Endpoints

- `POST /api/auth/login` - Admin login (returns JWT token)

## Running Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Test coverage
npm test -- --coverage
```

### Test Coverage

- ✅ Feedback submission with validation
- ✅ Rate limiting enforcement
- ✅ Admin authentication
- ✅ Protected route access control
- ✅ Gemini API integration (mocked)
- ✅ Error handling and edge cases

## Environment Variables

### Backend (.env)

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/feedpulse
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Docker (.env for docker-compose)

```
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret-key
```

## Key Implementation Details

### 1. AI Integration (Gemini)

- Uses `gemini-1.5-flash` model for fast, free feedback analysis
- Asynchronous processing to keep API responsive
- Graceful degradation - feedback is saved even if AI fails
- Parses structured JSON responses for consistency

### 2. Authentication & Authorization

- JWT-based authentication for admin routes
- Passwords hashed with bcryptjs (10 salt rounds)
- Token expiration set to 24 hours
- Middleware validates tokens on protected endpoints

### 3. Rate Limiting

- Per-IP rate limiting (5 submissions per hour)
- In-memory store for simplicity (use Redis in production)
- Returns 429 (Too Many Requests) status code when exceeded

### 4. Database Schema

- Comprehensive validation on Feedback model
- Indexed fields for query performance (status, category, priority, createdAt)
- Timestamps (createdAt, updatedAt) managed automatically
- Separate User collection for admin credentials



## Troubleshooting

### "MongoDB connection failed"

- Ensure MongoDB is running: `mongod`
- Check MONGO_URI is correct
- For Docker: wait for MongoDB to be healthy before starting backend

### "GEMINI_API_KEY not set"

- AI analysis is optional; feedback still saves
- Set the environment variable to enable AI features

### "Cannot find module" errors

- Run `npm install` in both frontend and backend
- Clear node_modules: `rm -rf node_modules && npm install`

### CORS errors in browser

- Ensure backend is running on port 4000
- Check NEXT_PUBLIC_API_URL matches backend URL
- Verify CORS is enabled in Express

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit with meaningful message: `git commit -m "Add feature X"`
4. Push and create a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the GitHub repository.
