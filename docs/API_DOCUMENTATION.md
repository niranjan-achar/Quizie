````markdown
# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Information
- **Access Token**: 7-day expiry, stored in localStorage
- **Refresh Token**: 30-day expiry, can be used to obtain new access token
- **Token Storage**: Frontend stores tokens in localStorage for auto-login

## Response Format

All API responses follow this structure:

```json
{
  "status": "success" | "error",
  "message": "Descriptive message",
  "data": { /* Response data */ }
}
```

---

## Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

Register a new user with username, email, and password.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `username`: 3-20 characters, alphanumeric + underscores, unique
- `email`: Valid email format, unique
- `password`: Minimum 8 characters

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 2. Login User

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "email": "john@example.com",
      "stats": {
        "totalQuizzesTaken": 15,
        "averageScore": 78.5,
        "totalCorrectAnswers": 235
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 3. Google OAuth Login

**GET** `/auth/google`

Redirect to Google OAuth consent screen.

**GET** `/auth/google/callback`

Google OAuth callback endpoint (handles token exchange).

---

### 4. Refresh Token

**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. Get User Profile

**GET** `/auth/profile`

Get current user's profile and statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "johndoe",
      "email": "john@example.com",
      "stats": {
        "totalQuizzesTaken": 15,
        "averageScore": 78.5,
        "totalCorrectAnswers": 235,
        "totalWrongAnswers": 65
      },
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Room Endpoints

### 1. Create Room

**POST** `/room/create`

Create a multiplayer quiz room.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Friday Quiz Night",
  "description": "Weekly team quiz",
  "quizId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Room created successfully",
  "data": {
    "room": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roomCode": "ABC123",
      "name": "Friday Quiz Night",
      "description": "Weekly team quiz",
      "host": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "username": "johndoe"
      },
      "members": [
        {
          "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
          "username": "johndoe",
          "joinedAt": "2026-01-14T10:00:00.000Z"
        }
      ],
      "quizId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "isActive": true,
      "createdAt": "2026-01-14T10:00:00.000Z"
    }
  }
}
```

---

### 2. Join Room

**POST** `/room/join`

Join an existing room using room code.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "roomCode": "ABC123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Joined room successfully",
  "data": {
    "room": { /* Room object with updated members */ }
  }
}
```

---

### 3. Get Room Details

**GET** `/room/:roomId`

Get room details including members and quiz info.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "room": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "roomCode": "ABC123",
      "name": "Friday Quiz Night",
      "host": { /* Host user object */ },
      "members": [ /* Array of member objects */ ],
      "quizId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "isActive": true,
      "quizSessions": [ /* Array of quiz sessions */ ]
    }
  }
}
```

---

### 4. Start Quiz (Host Only)

**POST** `/room/:roomId/start`

Start a quiz session in the room (host only).

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Quiz started",
  "data": {
    "sessionId": "65a1b2c3d4e5f6g7h8i9j0k3",
    "startedAt": "2026-01-14T10:30:00.000Z"
  }
}
```

---

### 5. Get Leaderboard

**GET** `/room/:roomId/leaderboard`

Get room leaderboard with member scores.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "username": "johndoe",
        "score": 95.5,
        "quizzesTaken": 3,
        "avgScore": 92.3
      },
      {
        "rank": 2,
        "username": "janedoe",
        "score": 87.0,
        "quizzesTaken": 2,
        "avgScore": 85.0
      }
    ]
  }
}
```

---

### 6. Leave Room

**POST** `/room/:roomId/leave`

Leave a room (members can leave, host leaving deletes room).

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Left room successfully"
}
```

---

## Quiz Endpoints

### 1. Generate Quiz

**POST** `/quiz/generate`

Generate a new quiz using Groq LLM (llama-3.3-70b-versatile).

**Request Body:**
```json
{
  "quizTitle": "JavaScript Fundamentals",
  "topic": "JavaScript ES6 Features",
  "numberOfQuestions": 20,
  "difficultyLevel": "medium",
  "timerInMinutes": 30,
  "additionalDescription": "Focus on arrow functions and async/await"
}
```

**Validation Rules:**
- `quizTitle`: 3-200 characters, required
- `topic`: 2-100 characters, required
- `numberOfQuestions`: One of [10, 15, 20, 30, 40, 50, 100], required
- `difficultyLevel`: One of ["easy", "medium", "difficult", "extreme"], required
- `timerInMinutes`: 1-300, required
- `additionalDescription`: 0-500 characters, optional

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Quiz generated successfully",
  "data": {
    "quiz": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quizTitle": "JavaScript Fundamentals",
      "topic": "JavaScript ES6 Features",
      "difficulty": "medium",
      "totalQuestions": 20,
      "timerInMinutes": 30,
      "questions": [
        {
          "questionId": 1,
          "questionText": "What is the purpose of arrow functions?",
          "options": {
            "A": "To replace all functions",
            "B": "Shorter syntax and lexical this binding",
            "C": "Only for callbacks",
            "D": "To create classes"
          },
          "correctAnswer": "B",
          "explanation": "Arrow functions provide a shorter syntax..."
        }
        // ... more questions
      ],
      "createdAt": "2026-01-14T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- 400: Validation error
- 500: Groq API error or server error

---

### 2. Get Quiz by ID

**GET** `/quiz/:id`

Retrieve a specific quiz with all questions.

**Parameters:**
- `id` (path): MongoDB ObjectId

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "quiz": { /* Full quiz object */ }
  }
}
```

**Error Responses:**
- 404: Quiz not found
- 400: Invalid ID format

---

### 3. Get Quiz Preview

**GET** `/quiz/:id/preview`

Get quiz metadata without questions (for preview purposes).

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "quiz": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quizTitle": "JavaScript Fundamentals",
      "topic": "JavaScript ES6 Features",
      "difficulty": "medium",
      "totalQuestions": 20,
      "timerInMinutes": 30,
      "createdAt": "2026-01-07T10:30:00.000Z"
    }
  }
}
```

---

### 4. Get All Quizzes

**GET** `/quiz`

Retrieve all quizzes with pagination and optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `topic` (optional): Filter by topic (regex search)
- `difficulty` (optional): Filter by difficulty

**Example:**
```
GET /quiz?page=1&limit=10&difficulty=medium&topic=javascript
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "quizzes": [
      { /* Quiz summary (without questions) */ }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### 5. Delete Quiz

**DELETE** `/quiz/:id`

Delete a quiz and its associated attempts.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Quiz deleted successfully"
}
```

---

### 6. Quiz Statistics

**GET** `/quiz/stats`

Get overall quiz statistics.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalQuizzes": 127,
    "avgQuestions": 25,
    "byDifficulty": {
      "easy": 32,
      "medium": 58,
      "difficult": 30,
      "extreme": 7
    }
  }
}
```

---

## Attempt Endpoints

### 1. Submit Attempt

**POST** `/attempt/submit`

Submit a completed quiz attempt.

**Request Body:**
```json
{
  "quizId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "userAnswers": [
    {
      "questionId": 1,
      "selectedAnswer": "B"
    },
    {
      "questionId": 2,
      "selectedAnswer": null
    }
    // ... all questions
  ],
  "timeTaken": 1245,
  "isAutoSubmitted": false
}
```

**Validation Rules:**
- `quizId`: Valid MongoDB ObjectId, required
- `userAnswers`: Array of answer objects, required
- `userAnswers[].questionId`: Integer, required
- `userAnswers[].selectedAnswer`: "A" | "B" | "C" | "D" | null
- `timeTaken`: Integer (seconds), required
- `isAutoSubmitted`: Boolean, optional (default: false)

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Quiz submitted successfully",
  "data": {
    "attemptId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "score": {
      "total": 20,
      "correct": 16,
      "wrong": 3,
      "unattempted": 1,
      "percentage": 80.00
    },
    "timeTaken": 1245,
    "grade": "A",
    "submittedAt": "2026-01-07T11:00:00.000Z",
    "isAutoSubmitted": false
  }
}
```

---

### 2. Get Attempt by ID

**GET** `/attempt/:id`

Retrieve full attempt details.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "attempt": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "quizId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quizSnapshot": {
        "quizTitle": "JavaScript Fundamentals",
        "topic": "JavaScript ES6 Features",
        "difficulty": "medium",
        "totalQuestions": 20,
        "timerInMinutes": 30
      },
      "userAnswers": [ /* ... */ ],
      "score": { /* ... */ },
      "timeTaken": 1245,
      "timeRemaining": 555,
      "submittedAt": "2026-01-07T11:00:00.000Z",
      "isAutoSubmitted": false
    }
  }
}
```

---

### 3. Get Attempt Review

**GET** `/attempt/:id/review`

Get attempt with correct answers and explanations for review.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "attemptId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "quizInfo": {
      "quizTitle": "JavaScript Fundamentals",
      "topic": "JavaScript ES6 Features",
      "difficulty": "medium",
      "totalQuestions": 20,
      "timerInMinutes": 30
    },
    "score": { /* ... */ },
    "grade": "A",
    "timeTaken": 1245,
    "submittedAt": "2026-01-07T11:00:00.000Z",
    "review": [
      {
        "questionId": 1,
        "questionText": "What is the purpose of arrow functions?",
        "options": { /* ... */ },
        "correctAnswer": "B",
        "userAnswer": "B",
        "isCorrect": true,
        "explanation": "Arrow functions provide..."
      }
      // ... all questions
    ]
  }
}
```

---

### 4. Get Attempts by Quiz

**GET** `/attempt/quiz/:quizId`

Get all attempts for a specific quiz.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "attempts": [
      { /* Attempt summary */ }
    ],
    "count": 15
  }
}
```

---

### 5. Get Attempt History

**GET** `/attempt/history`

Get all quiz attempts with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "attempts": [ /* ... */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 87,
      "pages": 9
    }
  }
}
```

---

### 6. Attempt Statistics

**GET** `/attempt/stats`

Get overall attempt statistics and performance data.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "overall": {
      "totalAttempts": 87,
      "averageScore": 78.45,
      "highestScore": 98.00,
      "lowestScore": 45.00
    },
    "recent": [
      { /* Recent attempt summaries */ }
    ],
    "performance": [
      {
        "score": { "percentage": 85 },
        "submittedAt": "2026-01-07T11:00:00.000Z"
      }
      // ... performance history
    ]
  }
}
```

---

### 7. Delete Attempt

**DELETE** `/attempt/:id`

Delete an attempt record.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Attempt deleted successfully"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ /* Validation errors if applicable */ ]
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET/DELETE
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Validation error or malformed request
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission (e.g., non-host trying to start quiz)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Groq API Specific Errors

```json
{
  "status": "error",
  "message": "Groq API Error",
  "details": {
    "statusCode": 429,
    "hint": "Rate limit exceeded. Please try again later."
  }
}
```

### Authentication Errors

```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "code": "TOKEN_EXPIRED"
}
```

---

## Rate Limiting

Currently not implemented. Recommended for production:
- 100 requests per 15 minutes per IP for quiz generation
- 1000 requests per hour for other endpoints
- Special limits for Google OAuth endpoints

---

## Sample Groq Request

### Request to Groq API

```javascript
POST https://api.groq.com/openai/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_GROQ_API_KEY
  Content-Type: application/json

Body:
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert quiz generator. Return only valid JSON."
    },
    {
      "role": "user",
      "content": "Generate 10 medium difficulty questions on JavaScript..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 8000,
  "response_format": { "type": "json_object" }
}
```

### Expected Groq Response

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"quizTitle\":\"JavaScript Essentials\",\"topic\":\"JavaScript\",\"difficulty\":\"medium\",\"totalQuestions\":10,\"questions\":[...]}"
      }
    }
  ],
  "model": "llama-3.3-70b-versatile",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 2500,
    "total_tokens": 2650
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Generate quiz (requires token)
curl -X POST http://localhost:3001/api/quiz/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "quizTitle": "Test Quiz",
    "topic": "Programming",
    "numberOfQuestions": 10,
    "difficultyLevel": "easy",
    "timerInMinutes": 15
  }'

# Create room (requires token)
curl -X POST http://localhost:3001/api/room/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Room",
    "description": "A test room",
    "quizId": "QUIZ_ID"
  }'

# Submit attempt (requires token)
curl -X POST http://localhost:3001/api/attempt/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "quizId": "QUIZ_ID",
    "userAnswers": [...],
    "timeTaken": 500
  }'
```

### Using Postman

Import the following environment variables:
- `BASE_URL`: http://localhost:3001/api
- `ACCESS_TOKEN`: (set after login/register)
- `REFRESH_TOKEN`: (set after login/register)
- `QUIZ_ID`: (set after creating a quiz)
- `ROOM_ID`: (set after creating a room)
- `ATTEMPT_ID`: (set after submitting an attempt)

**Collection Setup:**
1. Create "Auth" folder with Register, Login, Profile endpoints
2. Create "Room" folder with Create, Join, Start, Leaderboard endpoints
3. Create "Quiz" folder with Generate, Get, List endpoints
4. Create "Attempt" folder with Submit, Get, Review, History endpoints
5. Use {{ACCESS_TOKEN}} in Authorization header for protected routes

---

## Versioning

Current version: **v1**

Future versions will be accessible via `/api/v2/`, etc.

---

## Webhooks (Future Feature)

Future implementation will support webhooks for:
- Room member joined/left events
- Quiz started/completed events
- Leaderboard updates

---

## WebSocket Events (Future Feature)

Real-time updates using Socket.IO:
- `room:member-joined` - New member joins room
- `room:member-left` - Member leaves room
- `quiz:started` - Host starts quiz
- `quiz:completed` - Member completes quiz
- `leaderboard:updated` - Leaderboard scores change

---

````q