# AI-Powered Quiz System

A modern, multiplayer quiz platform powered by Groq LLM (llama-3.3-70b-versatile) for intelligent quiz generation with complete authentication and room-based multiplayer functionality.

## Features

### Core Features
- 🤖 **AI-powered quiz generation** using Groq LLM (llama-3.3-70b-versatile)
- 🔐 **Complete authentication system** with JWT (username/email/password + Google OAuth)
- 👥 **Multiplayer room system** with room codes and host controls
- 🏆 **Leaderboard system** for competitive gameplay
- ⏱️ **Real-time countdown timer** with auto-submission
- 📊 **Visual analytics** (pie charts, score graphs, performance insights)
- 📝 **Comprehensive answer review mode** with explanations
- 💾 **Persistent exam history and results**
- 🎯 **Multiple difficulty levels** (Easy, Medium, Difficult, Extreme)
- 🌓 **Dark mode** (default) with theme toggle
- 📱 **Fully responsive design** with mobile optimization
- 🌐 **LAN access support** for multi-device usage

### UI/UX Features
- 🎨 **Modern dark theme** with cyan gradients (default)
- 🍔 **Hamburger sidebar menu** for mobile navigation
- ✅ **Confirmation dialogs** for quiz submission
- 🧭 **Left-side question navigator** (25% width on desktop)
- 🔄 **Session management** with auto-login via localStorage
- 📏 **Optimized progress bar** (4px height)
- 🎯 **Sticky navigation** on desktop for easy question access

## Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router 6
- **State Management**: Context API (AuthContext, RoomContext, ThemeContext)
- **Charts**: Chart.js
- **HTTP Client**: Axios with interceptors
- **Icons**: React Icons
- **Styling**: CSS with CSS Variables for theming

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4
- **Database**: MongoDB 5+ with Mongoose 8
- **Authentication**: JWT (7-day access, 30-day refresh tokens)
- **Password Hashing**: bcryptjs 2.4.3
- **OAuth**: passport 0.7.0, passport-google-oauth20 2.0.0
- **Real-time**: socket.io 4.6.1 (ready for implementation)

### AI & External Services
- **LLM Provider**: Groq API (https://api.groq.com/openai/v1/chat/completions)
- **Model**: llama-3.3-70b-versatile

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- Groq API Key (from https://console.groq.com)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/niranjan-achar/Quizie.git
   cd Quizie
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (server + client)
   npm run install-all
   
   # Or install separately
   cd server && npm install
   cd ../client && npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/quiz-app
   
   # Groq API
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
   GROQ_MODEL=llama-3.3-70b-versatile
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here_min_32_chars
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Google OAuth (Optional - for Google login)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   
   **Development mode (recommended):**
   ```bash
   # From root directory - runs both server and client
   npm run dev
   ```
   
   **Or run separately:**
   ```bash
   # Terminal 1 - Backend server
   cd server
   npm run dev
   
   # Terminal 2 - Frontend React app
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - **LAN Access**: http://192.168.1.18:3000 (use your local IP)

### Network Configuration (LAN Access)

To access the app from other devices on the same network:

1. **Server** already binds to `0.0.0.0:3001` (all network interfaces)
2. **Client** runs on `0.0.0.0:3000`
3. **Find your local IP**:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.18)
   
   # Linux/Mac
   ifconfig
   ```
4. **Access from other devices**: `http://YOUR_LOCAL_IP:3000`

## Project Structure

```
Quiz/
├── server/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # User schema (auth, stats)
│   │   ├── Room.js                  # Room schema (multiplayer)
│   │   ├── Quiz.js                  # Quiz schema
│   │   └── QuizAttempt.js           # Attempt schema
│   ├── routes/
│   │   ├── auth.routes.js           # Authentication endpoints
│   │   ├── room.routes.js           # Room management endpoints
│   │   ├── quiz.routes.js           # Quiz CRUD endpoints
│   │   └── attempt.routes.js        # Attempt submission endpoints
│   ├── controllers/
│   │   ├── auth.controller.js       # Auth logic (register, login, OAuth)
│   │   ├── room.controller.js       # Room logic (create, join, manage)
│   │   ├── quiz.controller.js       # Quiz generation & management
│   │   └── attempt.controller.js    # Attempt scoring & retrieval
│   ├── services/
│   │   └── groq.service.js          # Groq LLM integration
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── errorHandler.js          # Global error handling
│   │   └── validator.js             # Request validation
│   ├── utils/
│   │   └── promptEngineering.js     # LLM prompt construction
│   └── index.js                     # Server entry point
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js         # Login form
│   │   │   │   ├── Signup.js        # Registration form
│   │   │   │   ├── ProtectedRoute.js # Auth guard
│   │   │   │   └── Auth.css
│   │   │   ├── Room/
│   │   │   │   ├── CreateRoom.js    # Room creation
│   │   │   │   ├── JoinRoom.js      # Room joining
│   │   │   │   ├── RoomDashboard.js # Room management
│   │   │   │   ├── Leaderboard.js   # Scores display
│   │   │   │   └── Room.css
│   │   │   ├── QuizCreation/
│   │   │   │   ├── QuizCreation.js  # Quiz form with confirmation
│   │   │   │   └── QuizCreation.css
│   │   │   ├── ExamMode/
│   │   │   │   ├── ExamMode.js      # Quiz taking interface
│   │   │   │   └── ExamMode.css     # 25%/75% layout
│   │   │   ├── Results/
│   │   │   │   ├── Results.js       # Score display with charts
│   │   │   │   └── Results.css
│   │   │   ├── Review/
│   │   │   │   ├── Review.js        # Answer review
│   │   │   │   └── Review.css       # Matching ExamMode layout
│   │   │   ├── History/
│   │   │   │   ├── History.js       # Attempt history
│   │   │   │   └── History.css
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.js        # Top navigation with hamburger
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.js       # Slide-out menu
│   │   │   │   └── Sidebar.css
│   │   │   └── ThemeToggle/
│   │   │       └── ThemeToggle.js   # Dark/Light mode switch
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Auth state + auto-login
│   │   │   ├── RoomContext.js       # Room state management
│   │   │   └── ThemeContext.js      # Theme state (default dark)
│   │   ├── services/
│   │   │   ├── authAPI.js           # Auth API calls
│   │   │   ├── roomAPI.js           # Room API calls
│   │   │   ├── quizAPI.js           # Quiz API calls
│   │   │   └── attemptAPI.js        # Attempt API calls
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.css                # Global styles + CSS variables
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── docs/
    ├── API_DOCUMENTATION.md
    └── ARCHITECTURE.md
```

## API Documentation

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for detailed API endpoints and usage.

## System Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design, data flow, and architecture diagrams.

## License

MIT



# Testing CI/CD Pipeline
# CI/CD Pipeline Test - Sun 18 Jan 2026 01:34:27 AM IST
