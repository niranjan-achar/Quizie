# Setup Guide

## Prerequisites

Before setting up the AI Quiz System, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for version control)
- **GROK API Key** - [Get from X.AI](https://x.ai/)

---

## Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd Quiz

# If downloaded as ZIP
# Extract the ZIP file and navigate to the Quiz folder
```

---

## Step 2: Install Dependencies

### Install Backend Dependencies

```bash
# From the project root directory
npm install
```

This will install:
- express
- mongoose
- cors
- dotenv
- axios
- express-validator
- morgan
- nodemon (dev dependency)
- concurrently (dev dependency)

### Install Frontend Dependencies

```bash
cd client
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- axios
- chart.js
- react-chartjs-2
- react-icons
- date-fns

---

## Step 3: Configure Environment Variables

### Create .env file

```bash
# From the project root directory
cp .env.example .env
```

### Edit .env file

Open `.env` and configure the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quiz-system

# GROK API Configuration
GROK_API_KEY=your_actual_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1/chat/completions

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Important**: Replace `your_actual_grok_api_key_here` with your real GROK API key from X.AI.

---

## Step 4: Start MongoDB

### Option 1: Local MongoDB

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-system?retryWrites=true&w=majority
```

---

## Step 5: Verify MongoDB Connection

```bash
# Check if MongoDB is running
mongosh

# Or for older versions
mongo
```

You should see the MongoDB shell. Type `exit` to quit.

---

## Step 6: Start the Application

### Option 1: Run Everything (Recommended for Development)

```bash
# From the project root directory
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

---

## Step 7: Verify Installation

### Check Backend Health

Open browser or use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Quiz System API is running",
  "timestamp": "2026-01-07T..."
}
```

### Check Frontend

Open browser:
```
http://localhost:3000
```

You should see the Quiz Creation page.

---

## Step 8: Test Quiz Generation

1. Navigate to http://localhost:3000
2. Fill in the quiz creation form:
   - **Quiz Title**: Test Quiz
   - **Topic**: Programming
   - **Number of Questions**: 10
   - **Difficulty**: Easy
   - **Timer**: 15 minutes
3. Click "Generate & Start Quiz"
4. Wait 20-40 seconds for GROK to generate questions
5. You should be redirected to Exam Mode

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   tasklist | findstr mongod
   
   # macOS/Linux
   ps aux | grep mongod
   ```

2. Verify `MONGODB_URI` in `.env`

3. Try connecting manually:
   ```bash
   mongosh mongodb://localhost:27017/quiz-system
   ```

---

### Issue: "GROK API key is not configured"

**Solutions:**
1. Verify `.env` file exists in project root
2. Check `GROK_API_KEY` is set correctly
3. Restart the server after changing `.env`

---

### Issue: "Port 5000 already in use"

**Solutions:**
1. Change `PORT` in `.env` to a different port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

---

### Issue: "Failed to generate quiz"

**Solutions:**
1. Check GROK API key is valid
2. Check internet connection
3. Verify GROK API endpoint in `.env`
4. Check backend logs for detailed error
5. Ensure you have GROK API credits/quota

---

### Issue: "Module not found" errors

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   # Backend
   rm -rf node_modules
   npm install
   
   # Frontend
   cd client
   rm -rf node_modules
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

---

## Production Deployment

### Build Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in `client/build/`.

### Serve Frontend from Backend (Optional)

Add to `server/index.js`:

```javascript
const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all handler for React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
```

### Environment Variables for Production

Update `.env`:

```env
NODE_ENV=production
PORT=80
MONGODB_URI=<production-mongodb-uri>
GROK_API_KEY=<production-grok-key>
CLIENT_URL=https://yourdomain.com
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name quiz-system

# View logs
pm2 logs quiz-system

# Restart
pm2 restart quiz-system

# Stop
pm2 stop quiz-system
```

---

## Docker Deployment (Optional)

### Create Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server ./server
COPY client/build ./client/build

EXPOSE 5000

CMD ["node", "server/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/quiz-system
      - GROK_API_KEY=${GROK_API_KEY}
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

### Run with Docker

```bash
docker-compose up -d
```

---

## Performance Optimization

### 1. Enable MongoDB Indexing

Indexes are automatically created by Mongoose schemas, but you can verify:

```javascript
// Connect to MongoDB
mongosh

// Switch to quiz-system database
use quiz-system

// Check indexes
db.quizzes.getIndexes()
db.quizattempts.getIndexes()
```

### 2. Add Redis Caching (Future Enhancement)

```bash
npm install redis
```

### 3. Enable Compression

```bash
npm install compression
```

```javascript
// server/index.js
const compression = require('compression');
app.use(compression());
```

### 4. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/quiz/generate', limiter);
```

---

## Monitoring

### View Logs

```bash
# Backend logs
npm run server

# PM2 logs (if using PM2)
pm2 logs quiz-system

# Follow logs in real-time
tail -f logs/app.log
```

### MongoDB Monitoring

```bash
# Connect to MongoDB
mongosh

# Database stats
db.stats()

# Collection stats
db.quizzes.stats()
db.quizattempts.stats()
```

---

## Backup and Restore

### Backup MongoDB

```bash
# Backup entire database
mongodump --db quiz-system --out ./backups/

# Backup to archive
mongodump --db quiz-system --archive=quiz-system-backup.gz --gzip
```

### Restore MongoDB

```bash
# Restore from dump
mongorestore --db quiz-system ./backups/quiz-system/

# Restore from archive
mongorestore --archive=quiz-system-backup.gz --gzip
```

---

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment-specific API keys** - Different keys for dev/prod
3. **Enable HTTPS in production** - Use Let's Encrypt
4. **Set secure CORS origins** - Restrict to your domain
5. **Implement rate limiting** - Prevent API abuse
6. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

---

## Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Review server logs for errors
4. Check MongoDB connection
5. Verify GROK API key validity

---

## Next Steps

After successful setup:
1. Explore the [API Documentation](./API_DOCUMENTATION.md)
2. Understand the [System Architecture](./ARCHITECTURE.md)
3. Read about [Prompt Engineering](./PROMPT_ENGINEERING.md)
4. Customize the quiz topics and difficulty levels
5. Add user authentication (future enhancement)
6. Deploy to production

---

## Useful Commands

```bash
# Install all dependencies
npm run install-all

# Run development mode
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Build frontend for production
cd client && npm run build

# Check for outdated packages
npm outdated

# Update all packages
npm update

# Clear MongoDB database
mongosh quiz-system --eval "db.dropDatabase()"

# View MongoDB collections
mongosh quiz-system --eval "show collections"
```

---

## Congratulations! 🎉

Your AI Quiz System is now set up and running. Start creating amazing quizzes powered by GROK LLM!
