````markdown
# System Architecture

## Overview

The AI Quiz System is a full-stack web application following a modern three-tier architecture with authentication and real-time multiplayer capabilities:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  React SPA (Single Page Application)                            │
│  - Component-based UI with React 18                             │
│  - React Router 6 for navigation                                │
│  - Context API (Auth, Room, Theme)                              │
│  - Axios with JWT interceptors                                  │
│  - Chart.js for data visualization                              │
│  - Dark mode with CSS variables (default)                       │
│  - Responsive design (desktop/mobile)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API (JWT)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      APPLICATION TIER                            │
│  Node.js + Express                                               │
│  - RESTful API endpoints                                         │
│  - JWT authentication (7d + 30d refresh)                        │
│  - Passport.js (Google OAuth)                                   │
│  - Request validation & error handling                           │
│  - Business logic & orchestration                                │
│  - Groq LLM integration service                                  │
│  - Socket.io ready for real-time updates                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ Mongoose ODM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                         DATA TIER                                │
│  MongoDB                                                         │
│  - User collection (auth, profile, stats)                       │
│  - Room collection (multiplayer, leaderboard)                   │
│  - Quiz collection (questions, metadata)                         │
│  - QuizAttempt collection (results, user answers)               │
└─────────────────────────────────────────────────────────────────┘

                         │ HTTPS API
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     EXTERNAL SERVICE                             │
│  Groq LLM API (https://api.groq.com)                            │
│  - Model: llama-3.3-70b-versatile                               │
│  - AI-powered quiz generation                                    │
│  - Natural language understanding                                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Registration/Login → Frontend Validation → POST /auth/register or /auth/login
→ Password Hashing (bcryptjs) → Database Storage → JWT Generation 
→ Return Tokens → Store in localStorage → Auto-login on Refresh
```

**Steps:**
1. User enters credentials (username, email, password) or uses Google OAuth
2. Frontend validates input format
3. Backend receives request, validates with express-validator
4. Password hashed with bcryptjs (salt rounds: 10)
5. User document created/found in MongoDB
6. JWT access token (7-day) and refresh token (30-day) generated
7. Tokens returned to frontend and stored in localStorage
8. Access token included in Authorization header for protected routes
9. Auto-login on page refresh using stored token

### 2. Room Creation & Multiplayer Flow

```
Create Room → Generate 6-char Code → Add Host as Member 
→ Share Code → Members Join → Host Starts Quiz → All Take Quiz 
→ Submit Results → Leaderboard Updates
```

**Steps:**
1. Authenticated user creates room with name, description, quiz ID
2. Backend generates unique 6-character alphanumeric room code
3. Host automatically added to members array
4. Room code shared with participants
5. Members join using room code
6. Host starts quiz session (only host can start)
7. All members take quiz individually
8. Scores submitted and calculated
9. Leaderboard updated with rankings
10. Real-time updates via Socket.io (future implementation)

### 3. Quiz Creation Flow

```
User Input → Frontend Validation → API Request → Prompt Engineering 
→ Groq LLM Call → Response Validation → Database Storage → Return Quiz ID 
→ Navigate to Exam Mode
```

**Steps:**
1. User fills quiz creation form (title, topic, difficulty, etc.)
2. Frontend shows confirmation dialog with quiz details
3. User confirms, POST request sent to `/api/quiz/generate`
4. Backend validates with express-validator
5. Prompt engineering module constructs optimal Groq prompt
6. Groq service calls API with retry logic (llama-3.3-70b-versatile)
7. Response validated against expected JSON schema
8. Quiz document created in MongoDB
9. Quiz ID returned to frontend
10. User redirected to exam mode

### 4. Exam Mode Flow

```
Load Quiz → Initialize Timer → User Interaction → Answer Tracking 
→ Submit (Manual/Auto) → Score Calculation → Result Generation
```

**Steps:**
1. Frontend fetches quiz by ID from `/api/quiz/:id`
2. Timer starts countdown from configured minutes
3. Desktop: Question navigator (25% left), quiz content (75% right), sticky nav
4. Mobile: Bottom navigator, side-by-side buttons
5. User navigates through questions, selects answers
6. Answers stored in React state in real-time
7. On submit or timer expiry, POST to `/api/attempt/submit`
8. Backend fetches original quiz questions
9. Calculate score by comparing user answers with correct answers
10. Store attempt in database with full metadata
11. Update user stats (totalQuizzesTaken, averageScore, etc.)
12. Return results with attempt ID
13. Navigate to results page

### 5. Results & Review Flow

```
Fetch Attempt → Display Scores → Generate Charts → Review Mode 
→ Question-by-Question Analysis → Export/Share Options
```

**Steps:**
1. Fetch attempt data from `/api/attempt/:id`
2. Display score breakdown with visual analytics (Chart.js)
3. Pie chart for correct/wrong/unattempted distribution
4. Bar chart for performance comparison
5. User can navigate to review mode
6. Review mode: Question navigator on left (25%), review content on right (75%)
7. Shows each question with correct/incorrect indicators
8. Displays explanations for all answers
9. Navigation buttons in navigator panel (desktop) or below content (mobile)

## Component Architecture

### Frontend Components

```
App (Router + Contexts)
├── AuthContext (JWT + auto-login)
├── RoomContext (multiplayer state)
├── ThemeContext (dark/light mode)
│
├── Navbar
│   ├── Logo
│   ├── Desktop Navigation (>768px)
│   ├── Hamburger Button (≤768px)
│   ├── Theme Toggle
│   └── Profile Menu
│
├── Sidebar (mobile slide-out)
│   ├── Navigation Links
│   ├── Theme Toggle
│   └── Close Button
│
├── Auth Pages
│   ├── Login
│   │   ├── Email/Password form
│   │   ├── Google OAuth button
│   │   └── Link to Signup
│   ├── Signup
│   │   ├── Username/Email/Password form
│   │   ├── Username availability check
│   │   └── Link to Login
│   └── ProtectedRoute (auth guard)
│
├── Room Components
│   ├── CreateRoom
│   │   ├── Room name input
│   │   ├── Description textarea
│   │   └── Quiz ID input
│   ├── JoinRoom
│   │   └── Room code input (6 chars)
│   ├── RoomDashboard
│   │   ├── Room info (name, code, host)
│   │   ├── Members list
│   │   ├── Start Quiz button (host only)
│   │   └── Leave Room button
│   └── Leaderboard
│       ├── Ranking table
│       ├── Score statistics
│       └── Performance charts
│
├── QuizCreation
│   ├── Form inputs
│   │   ├── Quiz title
│   │   ├── Topic
│   │   ├── Number of questions
│   │   ├── Difficulty level
│   │   ├── Timer duration
│   │   └── Additional description
│   ├── Confirmation Dialog
│   │   ├── Quiz details summary
│   │   ├── Confirm button
│   │   └── Cancel button
│   ├── Validation
│   └── Loading state
│
├── ExamMode
│   ├── Timer component (countdown)
│   ├── Progress bar (4px height)
│   ├── Question Navigator (25% width, sticky on desktop)
│   │   ├── Question status grid
│   │   ├── Navigation buttons (desktop bottom)
│   │   └── Submit button
│   ├── Quiz Content (75% width)
│   │   ├── Question display
│   │   ├── Answer options (A/B/C/D)
│   │   └── Navigation buttons (mobile bottom, side-by-side)
│   └── Auto-submit on timeout
│
├── Results
│   ├── Score overview
│   │   ├── Total/Correct/Wrong/Unattempted
│   │   ├── Percentage
│   │   └── Grade
│   ├── Statistical breakdown
│   ├── Pie chart (answer distribution)
│   ├── Bar chart (performance)
│   ├── Time analysis
│   └── Action buttons
│       ├── Review Answers
│       ├── Retake Quiz
│       └── Back to Home
│
├── Review
│   ├── Question Navigator (25% left, sticky)
│   │   ├── Question status (correct/wrong/unattempted)
│   │   ├── Navigation buttons (desktop bottom)
│   │   └── Back button
│   ├── Review Content (75% right)
│   │   ├── Question text
│   │   ├── All options with indicators
│   │   ├── User's answer (highlighted)
│   │   ├── Correct answer (highlighted)
│   │   ├── Explanation box
│   │   └── Navigation buttons (mobile bottom, side-by-side)
│   └── Score summary at top
│
├── History
│   ├── Statistics cards (compact, 180px)
│   │   ├── Total Attempts
│   │   ├── Average Score
│   │   ├── Best Score
│   │   └── Total Time
│   ├── Attempt list
│   │   ├── Quiz info
│   │   ├── Score circles (70px)
│   │   ├── Timestamp
│   │   └── Action buttons (Review/Retake)
│   └── Pagination
│
└── ThemeToggle
    ├── Sun icon (light mode)
    └── Moon icon (dark mode)
```

### Backend Modules

```
server/
├── index.js
│   ├── Express app initialization
│   ├── Middleware setup (CORS, JSON, etc.)
│   ├── Route mounting
│   ├── Error handling
│   └── Server start (0.0.0.0:3001)
│
├── config/
│   └── database.js
│       ├── MongoDB connection
│       ├── Connection retry logic
│       └── Event handlers
│
├── models/
│   ├── User.js
│   │   ├── username, email, password (hashed)
│   │   ├── googleId (OAuth)
│   │   ├── stats (quizzes taken, scores)
│   │   └── timestamps
│   ├── Room.js
│   │   ├── roomCode (6-char unique)
│   │   ├── name, description
│   │   ├── host (User ref)
│   │   ├── members array
│   │   ├── quizId (Quiz ref)
│   │   ├── quizSessions array
│   │   ├── leaderboard
│   │   └── isActive flag
│   ├── Quiz.js
│   │   ├── quizTitle, topic
│   │   ├── difficulty, totalQuestions
│   │   ├── timerInMinutes
│   │   ├── questions array
│   │   └── timestamps
│   └── QuizAttempt.js
│       ├── userId (User ref, optional)
│       ├── quizId (Quiz ref)
│       ├── roomId (Room ref, optional)
│       ├── quizSnapshot (denormalized)
│       ├── userAnswers array
│       ├── score breakdown
│       ├── timeTaken, timeRemaining
│       ├── grade, isAutoSubmitted
│       └── timestamps
│
├── routes/
│   ├── auth.routes.js
│   │   ├── POST /register
│   │   ├── POST /login
│   │   ├── GET /google
│   │   ├── GET /google/callback
│   │   ├── POST /refresh
│   │   └── GET /profile (protected)
│   ├── room.routes.js (all protected)
│   │   ├── POST /create
│   │   ├── POST /join
│   │   ├── GET /:roomId
│   │   ├── POST /:roomId/start
│   │   ├── GET /:roomId/leaderboard
│   │   └── POST /:roomId/leave
│   ├── quiz.routes.js
│   │   ├── POST /generate
│   │   ├── GET /:id
│   │   ├── GET /:id/preview
│   │   ├── GET / (list with pagination)
│   │   ├── DELETE /:id
│   │   └── GET /stats
│   └── attempt.routes.js
│       ├── POST /submit
│       ├── GET /:id
│       ├── GET /:id/review
│       ├── GET /quiz/:quizId
│       ├── GET /history
│       ├── GET /stats
│       └── DELETE /:id
│
├── controllers/
│   ├── auth.controller.js
│   │   ├── register (hash password, create user, generate tokens)
│   │   ├── login (verify password, generate tokens)
│   │   ├── googleAuth (OAuth callback handler)
│   │   ├── refreshToken (generate new access token)
│   │   └── getProfile (return user with stats)
│   ├── room.controller.js
│   │   ├── createRoom (generate code, add host)
│   │   ├── joinRoom (add member, validate code)
│   │   ├── getRoomDetails (populate host/members)
│   │   ├── startQuiz (host only, create session)
│   │   ├── getLeaderboard (calculate rankings)
│   │   └── leaveRoom (remove member, delete if host)
│   ├── quiz.controller.js
│   │   ├── generateQuiz (Groq API call, validate, store)
│   │   ├── getQuizById (fetch with questions)
│   │   ├── getQuizPreview (metadata only)
│   │   ├── getAllQuizzes (paginated list)
│   │   ├── deleteQuiz (cascade delete attempts)
│   │   └── getQuizStats (aggregation pipeline)
│   └── attempt.controller.js
│       ├── submitAttempt (calculate score, update stats)
│       ├── getAttemptById (full attempt data)
│       ├── getAttemptReview (with correct answers)
│       ├── getAttemptsByQuiz (filtered list)
│       ├── getAttemptHistory (paginated, user-specific)
│       ├── getAttemptStats (performance aggregation)
│       └── deleteAttempt (remove record)
│
├── services/
│   └── groq.service.js
│       ├── generateQuizWithGroq (API call)
│       ├── Retry logic (3 attempts, exponential backoff)
│       ├── Error handling (rate limits, timeouts)
│       └── Response validation
│
├── middleware/
│   ├── auth.middleware.js
│   │   ├── verifyToken (JWT validation)
│   │   ├── extractUser (attach user to req)
│   │   └── checkRefreshToken
│   ├── errorHandler.js
│   │   ├── Global error catcher
│   │   ├── Error formatting
│   │   └── Environment-based responses
│   └── validator.js
│       ├── express-validator rules
│       ├── Custom validators
│       └── Sanitization
│
└── utils/
    └── promptEngineering.js
        ├── Prompt construction for Groq
        ├── Template generation
        └── JSON schema validation
```

## Security Considerations

1. **Authentication & Authorization**
   - JWT tokens with secure secrets (min 32 characters)
   - Access tokens: 7-day expiry
   - Refresh tokens: 30-day expiry
   - Password hashing with bcryptjs (salt rounds: 10)
   - Protected routes with middleware verification
   - Role-based access (host-only actions in rooms)

2. **API Key Protection**
   - Groq API key stored in environment variables
   - Never exposed to frontend
   - Server-side API calls only

3. **Input Validation**
   - All user inputs validated using express-validator
   - Sanitization to prevent injection attacks
   - Type checking and format validation
   - Length restrictions on all text inputs

4. **Error Handling**
   - Comprehensive error handling prevents information leakage
   - Generic error messages in production
   - Detailed logs for debugging
   - No stack traces in production responses

5. **CORS Configuration**
   - Configured to accept requests from trusted frontend
   - Environment-based CORS settings
   - Credentials support for cookies/auth headers

6. **Data Sanitization**
   - MongoDB injection prevention via Mongoose
   - XSS protection through input sanitization
   - Output encoding for user-generated content

7. **Session Management**
   - Token stored in localStorage (auto-login)
   - Token refresh mechanism
   - Logout clears all stored credentials

## Scalability Considerations

1. **Stateless Backend**
   - No session storage on server
   - JWT tokens contain all necessary user info
   - Easy to horizontally scale
   - Load balancer compatible

2. **Database Optimization**
   - MongoDB indexes on frequently queried fields:
     - User: username, email
     - Room: roomCode, host
     - Quiz: _id, topic, difficulty
     - QuizAttempt: userId, quizId, roomId
   - Compound indexes for complex queries
   - Pagination for large result sets

3. **Caching Strategy** (Future)
   - Redis for frequently accessed quizzes
   - User profile caching
   - Room data caching
   - Cache invalidation on updates

4. **Connection Pooling**
   - MongoDB connection reuse
   - Axios instance reuse
   - Keep-alive headers

5. **Load Balancing**
   - Server binds to 0.0.0.0 (all interfaces)
   - Can run behind Nginx/HAProxy
   - Multiple instances with PM2
   - Round-robin or least-connection strategies

6. **Microservices Ready**
   - Groq service is isolated
   - Auth can be separated
   - Room service can be independent
   - API versioning support

## Performance Optimizations

1. **Frontend Optimizations**
   - React.lazy for code splitting
   - Lazy loading of components
   - Memoization with useMemo/useCallback
   - Virtual scrolling for large lists
   - Debouncing for username availability check
   - CSS animations with GPU acceleration

2. **Backend Optimizations**
   - Pagination for all list endpoints
   - Selective projection (fetch only required fields)
   - Aggregation pipelines for statistics
   - Retry logic with exponential backoff for Groq API
   - Request compression (gzip)

3. **Database Optimizations**
   - Indexes on search fields
   - Denormalized quizSnapshot in attempts (avoid joins)
   - Bulk operations for batch updates
   - Connection pooling

4. **Network Optimizations**
   - CORS pre-flight caching
   - HTTP compression
   - CDN for static assets (production)
   - Browser caching headers

5. **Asset Optimization**
   - CSS minification
   - JavaScript bundling and minification
   - Image optimization
   - Font subsetting

## Deployment Architecture

```
┌─────────────────┐
│   Cloudflare    │  (CDN, SSL, DDoS protection, caching)
└────────┬────────┘
         │
┌────────▼────────┐
│   Nginx         │  (Reverse proxy, load balancer, static files)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌──▼──────┐
│ React  │ │ Node.js │  (Multiple instances with PM2)
│ Build  │ │ Express │
└────────┘ └────┬────┘
                │
         ┌──────┴──────┐
         │             │
    ┌────▼────┐   ┌───▼─────┐
    │ MongoDB │   │  Groq   │
    │  Atlas  │   │   API   │
    └─────────┘   └─────────┘
```

### Deployment Steps

1. **Frontend Deployment**
   - Build React app: `npm run build`
   - Upload to static hosting (Vercel, Netlify) or serve via Nginx
   - Configure environment variables (API URL)
   - Enable gzip compression
   - Set up CDN

2. **Backend Deployment**
   - Set up Node.js server (DigitalOcean, AWS EC2, Heroku)
   - Install dependencies: `npm install --production`
   - Configure environment variables (.env)
   - Set up PM2 for process management
   - Configure Nginx reverse proxy
   - Enable SSL/TLS with Let's Encrypt
   - Set up logging and monitoring

3. **Database Setup**
   - MongoDB Atlas (managed) or self-hosted
   - Configure connection string with authentication
   - Set up backup strategy
   - Create indexes
   - Enable monitoring and alerts

4. **Environment Configuration**
   ```
   Production:
   - NODE_ENV=production
   - Secure JWT secrets
   - MongoDB Atlas connection string
   - Groq API key
   - CORS restricted to frontend domain
   - Error logging enabled
   
   Staging:
   - NODE_ENV=staging
   - Test credentials
   - Staging database
   - Debug logging enabled
   ```

5. **Monitoring & Logging**
   - PM2 logs for Node.js
   - MongoDB performance monitoring
   - API error tracking (Sentry)
   - User analytics (Google Analytics)
   - Server monitoring (New Relic, DataDog)

6. **CI/CD Pipeline**
   - GitHub Actions workflow
   - Automated testing
   - Automated deployment on push to main
   - Rollback strategy

## Technology Justifications

### Why React?
- **Component reusability**: Modular UI components (Navbar, Sidebar, etc.)
- **Virtual DOM**: Optimal performance for dynamic updates
- **Rich ecosystem**: React Router, Chart.js, Context API
- **Strong community**: Large community, extensive libraries
- **React 18**: Concurrent features, automatic batching
- **Developer experience**: Hot reload, DevTools, TypeScript support

### Why Node.js + Express?
- **JavaScript full-stack**: Consistency across frontend and backend
- **Non-blocking I/O**: Perfect for Groq API calls and database operations
- **Fast development**: npm ecosystem with 2M+ packages
- **Easy MongoDB integration**: Mongoose ODM simplifies data modeling
- **Scalable**: Horizontal scaling with PM2 or clustering
- **WebSocket support**: Socket.io for real-time features

### Why MongoDB?
- **Flexible schema**: Varying question formats, easy schema evolution
- **JSON-native**: Perfect match for Groq response format
- **Horizontal scalability**: Sharding for large datasets
- **Rich query capabilities**: Aggregation pipelines for statistics
- **Indexes**: Fast lookups on username, room codes, etc.
- **Atlas**: Managed service with backup and monitoring

### Why Groq LLM (llama-3.3-70b-versatile)?
- **High-quality generation**: State-of-the-art language model
- **Fast inference**: Groq's LPU technology for speed
- **JSON output support**: Structured data generation
- **Cost-effective**: Competitive pricing vs OpenAI
- **Versatile model**: Handles various topics and difficulty levels
- **Reliable API**: Good uptime and support

### Why JWT for Authentication?
- **Stateless**: No server-side session storage
- **Scalable**: Works across multiple server instances
- **Mobile-friendly**: Easy to integrate with mobile apps
- **Flexible**: Can include custom claims (user role, etc.)
- **Secure**: Signed tokens prevent tampering
- **Refresh tokens**: Long-term session without compromising security

### Why Context API (vs Redux)?
- **Simpler setup**: No boilerplate, built into React
- **Sufficient for app size**: Not complex enough for Redux
- **Multiple contexts**: Auth, Room, Theme separated
- **Good performance**: With proper memoization
- **No external dependencies**: Reduces bundle size

### Why CSS Variables (vs Styled Components)?
- **Performance**: No runtime overhead
- **Simple theming**: Easy dark/light mode switching
- **Browser support**: Wide compatibility
- **No build step**: Works with plain CSS
- **Easy debugging**: Visible in DevTools
- **localStorage integration**: Theme persistence

## Database Schema Design

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  googleId: String (optional, for OAuth),
  stats: {
    totalQuizzesTaken: Number (default: 0),
    averageScore: Number (default: 0),
    totalCorrectAnswers: Number (default: 0),
    totalWrongAnswers: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Room Schema
```javascript
{
  _id: ObjectId,
  roomCode: String (6-char, unique, indexed),
  name: String,
  description: String,
  host: ObjectId (ref: User, indexed),
  members: [{
    userId: ObjectId (ref: User),
    username: String,
    joinedAt: Date
  }],
  quizId: ObjectId (ref: Quiz),
  isActive: Boolean (default: true),
  quizSessions: [{
    sessionId: ObjectId,
    startedAt: Date,
    completedAt: Date
  }],
  leaderboard: [{
    userId: ObjectId (ref: User),
    username: String,
    score: Number,
    rank: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Schema
```javascript
{
  _id: ObjectId (indexed),
  quizTitle: String,
  topic: String (indexed),
  difficulty: String (indexed, enum: easy/medium/difficult/extreme),
  totalQuestions: Number,
  timerInMinutes: Number,
  additionalDescription: String,
  questions: [{
    questionId: Number,
    questionText: String,
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: String (enum: A/B/C/D),
    explanation: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### QuizAttempt Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, optional, indexed),
  quizId: ObjectId (ref: Quiz, indexed),
  roomId: ObjectId (ref: Room, optional, indexed),
  quizSnapshot: {
    quizTitle: String,
    topic: String,
    difficulty: String,
    totalQuestions: Number,
    timerInMinutes: Number
  },
  userAnswers: [{
    questionId: Number,
    selectedAnswer: String (enum: A/B/C/D/null),
    isCorrect: Boolean,
    timeTaken: Number (seconds)
  }],
  score: {
    total: Number,
    correct: Number,
    wrong: Number,
    unattempted: Number,
    percentage: Number (2 decimals)
  },
  timeTaken: Number (seconds),
  timeRemaining: Number (seconds),
  grade: String (enum: A+/A/B/C/D/F),
  isAutoSubmitted: Boolean (default: false),
  submittedAt: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Index Strategy
```javascript
// User
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { sparse: true })

// Room
db.rooms.createIndex({ roomCode: 1 }, { unique: true })
db.rooms.createIndex({ host: 1 })
db.rooms.createIndex({ isActive: 1 })
db.rooms.createIndex({ createdAt: -1 })

// Quiz
db.quizzes.createIndex({ _id: 1 })
db.quizzes.createIndex({ topic: 1 })
db.quizzes.createIndex({ difficulty: 1 })
db.quizzes.createIndex({ createdAt: -1 })

// QuizAttempt
db.quizattempts.createIndex({ userId: 1, submittedAt: -1 })
db.quizattempts.createIndex({ quizId: 1 })
db.quizattempts.createIndex({ roomId: 1 })
db.quizattempts.createIndex({ submittedAt: -1 })

// Compound indexes
db.quizattempts.createIndex({ userId: 1, quizId: 1, submittedAt: -1 })
db.rooms.createIndex({ host: 1, isActive: 1 })
```

## API Response Time Targets

| Endpoint | Target (p95) | Description |
|----------|--------------|-------------|
| POST /auth/register | < 500ms | Password hashing adds overhead |
| POST /auth/login | < 300ms | Bcrypt comparison |
| GET /auth/profile | < 100ms | Simple user fetch |
| POST /quiz/generate | < 15s | Groq API call (network dependent) |
| GET /quiz/:id | < 200ms | Indexed query |
| POST /attempt/submit | < 500ms | Score calculation + stats update |
| GET /attempt/:id/review | < 300ms | Join with quiz data |
| POST /room/create | < 200ms | Room creation + code generation |
| POST /room/join | < 200ms | Member addition |
| GET /room/:id/leaderboard | < 500ms | Aggregation pipeline |

## Future Enhancements

### Phase 1 (Short-term)
1. ✅ **User Authentication**: JWT-based auth (COMPLETED)
2. ✅ **Multiplayer Rooms**: Room-based competition (COMPLETED)
3. ✅ **Dark Mode**: Theme toggle with persistence (COMPLETED)
4. 🔄 **Real-time Updates**: Socket.io for live leaderboard (IN PROGRESS)
5. ⏳ **Email Verification**: Verify email on registration
6. ⏳ **Password Reset**: Forgot password flow with email

### Phase 2 (Medium-term)
7. ⏳ **Advanced Analytics**: Learning patterns, weak topics identification
8. ⏳ **Question Bank**: Save and reuse generated questions
9. ⏳ **Custom Question Upload**: Manual question entry with editor
10. ⏳ **PDF Export**: Export results and review as PDF
11. ⏳ **Quiz Sharing**: Share quizzes via link
12. ⏳ **Timed Sections**: Different time limits per section

### Phase 3 (Long-term)
13. ⏳ **Mobile App**: React Native version
14. ⏳ **AI Difficulty Adjustment**: Dynamic difficulty based on performance
15. ⏳ **Global Leaderboards**: Cross-room rankings
16. ⏳ **Social Features**: Friend system, challenges, achievements
17. ⏳ **Voice Recognition**: Answer questions via voice
18. ⏳ **Multi-language Support**: i18n for global audience
19. ⏳ **AI Tutor**: Personalized learning recommendations
20. ⏳ **Gamification**: Points, badges, levels, rewards

### Infrastructure Enhancements
- Redis caching layer
- Elasticsearch for advanced search
- GraphQL API alternative
- Docker containerization
- Kubernetes orchestration
- CI/CD pipeline automation
- Comprehensive test coverage (Jest, Cypress)
- Performance monitoring (New Relic)
- Error tracking (Sentry)
- Analytics dashboard (Google Analytics, Mixpanel)

## Conclusion

The AI Quiz System is built with modern, scalable technologies following best practices in web development. The architecture supports:
- **High Performance**: Optimized queries, caching, lazy loading
- **Security**: JWT auth, input validation, secure storage
- **Scalability**: Stateless design, database indexing, load balancing
- **User Experience**: Dark mode, responsive design, real-time updates
- **Developer Experience**: Clear separation of concerns, modular code, documentation

The system is production-ready and designed to handle growth from individual users to large-scale multiplayer competitions.

````