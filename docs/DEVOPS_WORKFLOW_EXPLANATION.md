# Quizie Application - Complete DevOps Workflow & Architecture

## 📋 Table of Contents
1. Application Overview
2. Complete DevOps Workflow
3. Dockerization Process
4. CI/CD Pipeline (GitHub Actions)
5. Kubernetes Deployment
6. Ansible Automation
7. How Users Access the Application
8. End-to-End Flow Diagram

================================================================================
## 1. APPLICATION OVERVIEW
================================================================================

**Quizie** is a full-stack quiz application with AI-powered quiz generation.

### Technology Stack:
- **Frontend**: React.js (runs on port 3000)
- **Backend**: Node.js/Express (runs on port 5000)
- **Database**: MongoDB (runs on port 27017)
- **AI Integration**: Grok API for quiz generation

### Architecture:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   MongoDB   │
│  (React)    │     │  (Express)  │     │  (Database) │
│  Port 3000  │     │  Port 5000  │     │  Port 27017 │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Grok API   │
                    │ (Quiz Gen)  │
                    └─────────────┘
```

================================================================================
## 2. COMPLETE DEVOPS WORKFLOW
================================================================================

### Step-by-Step Flow: Code to Production

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: LOCAL DEVELOPMENT                                        │
└──────────────────────────────────────────────────────────────────┘
Developer writes code
    ├── backend/index.js (API endpoints)
    ├── frontend/src/App.js (UI components)
    └── Tests locally (npm start)

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: VERSION CONTROL (GIT)                                   │
└──────────────────────────────────────────────────────────────────┘
Developer commits and pushes:
    $ git add .
    $ git commit -m "feat: add new feature"
    $ git push origin main

Code pushed to: https://github.com/niranjan-achar/Quizie

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: CI/CD PIPELINE (GITHUB ACTIONS) - AUTOMATIC             │
└──────────────────────────────────────────────────────────────────┘
GitHub Actions workflow triggers automatically:
    
    Workflow File: .github/workflows/ci-pipeline.yaml
    
    Jobs:
    1. Checkout code from GitHub
    2. Setup Docker Buildx
    3. Login to Docker Hub (using secrets)
    4. Build Backend Docker Image
       - Base: node:18-alpine
       - Install dependencies
       - Copy backend code
       - Expose port 5000
    5. Tag image: niranjanachar/quizie-backend:latest
    6. Tag image: niranjanachar/quizie-backend:<commit-hash>
    7. Push to Docker Hub
    8. Build Frontend Docker Image
       - Base: node:18-alpine
       - Install dependencies
       - Build React app (npm run build)
       - Serve with nginx/serve
       - Expose port 3000
    9. Tag image: niranjanachar/quizie-frontend:latest
    10. Tag image: niranjanachar/quizie-frontend:<commit-hash>
    11. Push to Docker Hub

Time: ~5-7 minutes

Docker Hub Registry:
    ✓ hub.docker.com/r/niranjanachar/quizie-backend
    ✓ hub.docker.com/r/niranjanachar/quizie-frontend

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: INFRASTRUCTURE PROVISIONING (ANSIBLE) - MANUAL           │
└──────────────────────────────────────────────────────────────────┘
DevOps engineer runs Ansible playbook:
    $ ansible-playbook -i ansible/inventory.yaml \
      ansible/playbook-deploy-k8s.yaml

Ansible Tasks:
    1. Create 'quizie' namespace in Kubernetes
    2. Create Secrets:
       - mongodb-secret (DB credentials)
       - api-secrets (API keys, JWT secret)
    3. Create ConfigMaps:
       - db-config (MongoDB URI, env variables)
    4. Deploy MongoDB StatefulSet:
       - 1 replica with persistent storage (10Gi)
       - Service: mongodb-service (port 27017)
    5. Deploy Backend:
       - 2 replicas (high availability)
       - Pull image: niranjanachar/quizie-backend:latest
       - Environment variables from ConfigMap/Secret
       - Service: backend-service (port 5000)
       - Health checks on /api/health
    6. Deploy Frontend:
       - 2 replicas (high availability)
       - Pull image: niranjanachar/quizie-frontend:latest
       - Environment: REACT_APP_API_URL
       - Service: frontend-service (port 80)
    7. Wait for all pods to be Running
    8. Display deployment status

Time: ~2-3 minutes

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: KUBERNETES ORCHESTRATION - RUNNING                      │
└──────────────────────────────────────────────────────────────────┘
Kubernetes cluster (Minikube) manages:

Pods Running:
    ├── backend-deployment-xxxxx (Pod 1) - Running
    ├── backend-deployment-yyyyy (Pod 2) - Running
    ├── frontend-deployment-zzzzz (Pod 1) - Running
    ├── frontend-deployment-aaaaa (Pod 2) - Running
    └── mongodb-0 (StatefulSet) - Running

Services:
    ├── backend-service (ClusterIP: 5000)
    ├── frontend-service (ClusterIP: 80)
    └── mongodb-service (ClusterIP: 27017)

Auto-Healing:
    - If pod crashes → Kubernetes restarts it
    - If pod fails health check → Kubernetes recreates it
    - Maintains desired replica count (2 for frontend, 2 for backend)

Load Balancing:
    - Traffic distributed across backend pods (2 replicas)
    - Traffic distributed across frontend pods (2 replicas)

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: ACCESS APPLICATION - PORT FORWARDING                    │
└──────────────────────────────────────────────────────────────────┘
Setup port forwarding to access locally:
    $ kubectl port-forward -n quizie svc/frontend-service 3000:80
    $ kubectl port-forward -n quizie svc/backend-service 5000:5000

Now accessible at:
    ✓ Frontend: http://localhost:3000
    ✓ Backend API: http://localhost:5000/api

                    ↓

┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: USER ACCESS                                             │
└──────────────────────────────────────────────────────────────────┘
User opens browser → http://localhost:3000
    ↓
Frontend loads (React app)
    ↓
User performs action (login, create quiz, etc.)
    ↓
Frontend sends API request to: http://localhost:5000/api
    ↓
Backend processes request
    ↓
Backend queries MongoDB (mongodb-service:27017)
    ↓
Response sent back to Frontend
    ↓
User sees result
```

================================================================================
## 3. DOCKERIZATION PROCESS
================================================================================

### YES, DOCKERIZATION IS HAPPENING! ✅

### Backend Dockerfile (backend/Dockerfile):
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5000/api/health')"
CMD ["node", "index.js"]
```

### Frontend Dockerfile (frontend/Dockerfile):
```dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight server
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

### Benefits of Dockerization:
1. **Consistency**: Same environment everywhere (dev, test, prod)
2. **Portability**: Runs on any system with Docker
3. **Isolation**: Each service in its own container
4. **Scalability**: Easy to scale with multiple containers
5. **Version Control**: Images tagged with commit hash

### Docker Images Created:
- `niranjanachar/quizie-backend:latest`
- `niranjanachar/quizie-backend:<commit-hash>`
- `niranjanachar/quizie-frontend:latest`
- `niranjanachar/quizie-frontend:<commit-hash>`

================================================================================
## 4. CI/CD PIPELINE (GITHUB ACTIONS)
================================================================================

### YES, CI/CD IS HAPPENING! ✅

### Workflow File: .github/workflows/ci-pipeline.yaml

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
    
    steps:
      1. Checkout code
      2. Set up Docker Buildx
      3. Login to Docker Hub
      4. Extract commit hash
      5. Build and push Backend image
      6. Build and push Frontend image
```

### What Triggers CI/CD:
- **Trigger**: Push to `main` branch
- **Action**: Automatically builds and pushes Docker images
- **Duration**: 5-7 minutes
- **Output**: New images on Docker Hub

### CI/CD Benefits:
1. **Automation**: No manual builds needed
2. **Consistency**: Every commit gets same build process
3. **Speed**: Parallel builds for backend and frontend
4. **Reliability**: Automated testing and builds
5. **Traceability**: Each commit linked to specific image tag

### Continuous Integration (CI):
- ✅ Code pushed to GitHub
- ✅ Automated build triggered
- ✅ Docker images created
- ✅ Images pushed to registry

### Continuous Deployment (CD):
- ✅ Images available on Docker Hub
- ⚠️ Deployment to Kubernetes (manual via Ansible)
- ✅ Alternative: Vercel auto-deploys from git

================================================================================
## 5. KUBERNETES DEPLOYMENT
================================================================================

### Kubernetes Resources Created:

#### 1. Namespace:
```yaml
Name: quizie
Purpose: Isolate all app resources
```

#### 2. Secrets:
```yaml
mongodb-secret:
  - mongodb_username: admin
  - mongodb_password: Ninja@321

api-secrets:
  - GROK_API_KEY: <your-key>
  - JWT_SECRET: <your-secret>
```

#### 3. ConfigMaps:
```yaml
db-config:
  - MONGODB_URI: mongodb://admin:Ninja%40321@mongodb-service:27017/quiz-system
  - NODE_ENV: production
  - LOG_LEVEL: info
```

#### 4. MongoDB StatefulSet:
```yaml
Replicas: 1
Storage: 10Gi (persistent)
Port: 27017
Service: mongodb-service (ClusterIP)
```

#### 5. Backend Deployment:
```yaml
Replicas: 2 (high availability)
Image: niranjanachar/quizie-backend:latest
Port: 5000
Service: backend-service (ClusterIP)
Health Check: /api/health
Environment: From ConfigMap and Secret
```

#### 6. Frontend Deployment:
```yaml
Replicas: 2 (high availability)
Image: niranjanachar/quizie-frontend:latest
Port: 3000
Service: frontend-service (ClusterIP)
Environment: REACT_APP_API_URL
```

### Kubernetes Benefits:
1. **Self-Healing**: Auto-restarts failed pods
2. **Load Balancing**: Distributes traffic across replicas
3. **Scaling**: Easy to scale up/down (kubectl scale)
4. **Rolling Updates**: Zero-downtime deployments
5. **Resource Management**: CPU/memory limits

================================================================================
## 6. ANSIBLE AUTOMATION
================================================================================

### Ansible Playbook: ansible/playbook-deploy-k8s.yaml

```yaml
Tasks:
  1. Create namespace
  2. Create secrets (if not exist)
  3. Create configmaps
  4. Apply MongoDB StatefulSet
  5. Apply Services
  6. Apply Backend Deployment
  7. Apply Frontend Deployment
  8. Wait for MongoDB ready
  9. Wait for Backend ready (2 pods)
  10. Wait for Frontend ready (2 pods)
  11. Get all pods status
  12. Display deployment info
```

### Ansible Benefits:
1. **Idempotent**: Can run multiple times safely
2. **Declarative**: Describes desired state
3. **Automated**: Single command deployment
4. **Consistent**: Same deployment every time
5. **Auditable**: All changes logged

### Running Ansible:
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml
```

================================================================================
## 7. HOW USERS ACCESS THE APPLICATION
================================================================================

### Access Methods:

#### Method 1: Local Kubernetes (Minikube) - PORT FORWARD
```
User's Browser (localhost:3000)
    ↓
Port Forward (kubectl port-forward)
    ↓
Kubernetes Service (frontend-service:80)
    ↓
Frontend Pod (React app)
    ↓ (API calls to localhost:5000)
Port Forward (kubectl port-forward)
    ↓
Kubernetes Service (backend-service:5000)
    ↓
Backend Pod (Node.js API)
    ↓
MongoDB Service (mongodb-service:27017)
    ↓
MongoDB Pod (Database)
```

**Commands:**
```bash
kubectl port-forward -n quizie svc/frontend-service 3000:80
kubectl port-forward -n quizie svc/backend-service 5000:5000
# Access: http://localhost:3000
```

#### Method 2: Production (Vercel) - PUBLIC URL
```
User's Browser (https://quizie-quiz.vercel.app)
    ↓
Vercel CDN (global)
    ↓
Frontend (React app on Vercel)
    ↓ (API calls to https://quizie-backend.vercel.app/api)
Vercel Serverless Functions
    ↓
Backend API (Node.js on Vercel)
    ↓
MongoDB Atlas (cloud database)
```

**Access:**
- Frontend: https://quizie-quiz.vercel.app
- Backend: https://quizie-backend.vercel.app/api

#### Method 3: Local Development - DIRECT
```
User's Browser (localhost:3000)
    ↓
Frontend Dev Server (npm start)
    ↓ (API calls to localhost:5000)
Backend Dev Server (npm start)
    ↓
MongoDB (local or Atlas)
```

**Commands:**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start

# Access: http://localhost:3000
```

================================================================================
## 8. END-TO-END FLOW DIAGRAM
================================================================================

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────┘

    Developer
        │
        ├─► Write Code (VS Code)
        │
        ├─► Test Locally (npm start)
        │
        ├─► Commit (git commit)
        │
        └─► Push (git push origin main)
                │
                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                                 │
│               https://github.com/niranjan-achar/Quizie              │
└─────────────────────────────────────────────────────────────────────┘
                │
                ↓ (Automatic trigger)
┌─────────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS (CI/CD)                           │
│               .github/workflows/ci-pipeline.yaml                     │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├─► Checkout Code
        ├─► Build Backend Docker Image
        ├─► Build Frontend Docker Image
        ├─► Push to Docker Hub
        │
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCKER HUB REGISTRY                              │
│               hub.docker.com/r/niranjanachar/                       │
└─────────────────────────────────────────────────────────────────────┘
        │
        │   Images Available:
        ├─► quizie-backend:latest
        ├─► quizie-backend:<commit-hash>
        ├─► quizie-frontend:latest
        └─► quizie-frontend:<commit-hash>
                │
                ↓ (Manual deployment)
┌─────────────────────────────────────────────────────────────────────┐
│                    ANSIBLE AUTOMATION                               │
│               ansible-playbook deploy-k8s.yaml                      │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├─► Create Namespace
        ├─► Create Secrets
        ├─► Create ConfigMaps
        ├─► Deploy MongoDB
        ├─► Deploy Backend (2 replicas)
        ├─► Deploy Frontend (2 replicas)
        └─► Verify Pods Running
                │
                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER (MINIKUBE)                    │
│                         Namespace: quizie                            │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├─► Pod: backend-deployment-xxxxx (Running)
        ├─► Pod: backend-deployment-yyyyy (Running)
        ├─► Pod: frontend-deployment-zzzzz (Running)
        ├─► Pod: frontend-deployment-aaaaa (Running)
        └─► Pod: mongodb-0 (Running)
                │
                ├─► Service: backend-service (5000)
                ├─► Service: frontend-service (80)
                └─► Service: mongodb-service (27017)
                        │
                        ↓ (Port Forward)
┌─────────────────────────────────────────────────────────────────────┐
│                    LOCAL MACHINE                                     │
│               kubectl port-forward                                   │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├─► localhost:3000 → frontend-service
        └─► localhost:5000 → backend-service
                │
                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                                    │
│               http://localhost:3000                                  │
└─────────────────────────────────────────────────────────────────────┘
```

================================================================================
## SUMMARY: DevOps Practices Implemented
================================================================================

✅ **Version Control**: Git + GitHub
✅ **Containerization**: Docker (multi-stage builds)
✅ **Container Registry**: Docker Hub
✅ **CI/CD Pipeline**: GitHub Actions (automated builds)
✅ **Infrastructure as Code**: Ansible playbooks
✅ **Container Orchestration**: Kubernetes (Minikube)
✅ **Configuration Management**: Kubernetes ConfigMaps & Secrets
✅ **High Availability**: 2 replicas for frontend and backend
✅ **Self-Healing**: Kubernetes auto-restart
✅ **Load Balancing**: Kubernetes Services
✅ **Persistent Storage**: StatefulSet for MongoDB
✅ **Health Checks**: Liveness & Readiness probes
✅ **Monitoring**: kubectl logs and events
✅ **Cloud Deployment**: Vercel (alternative)

================================================================================
## WORKFLOW TIMELINE
================================================================================

Developer pushes code
    ⏱️  Instant
        ↓
GitHub Actions builds images
    ⏱️  5-7 minutes
        ↓
Images pushed to Docker Hub
    ⏱️  1-2 minutes
        ↓
DevOps runs Ansible playbook
    ⏱️  2-3 minutes
        ↓
Kubernetes deploys pods
    ⏱️  1-2 minutes
        ↓
Application ready to use
    ⏱️  Total: ~10-15 minutes

================================================================================
## ACCESS URLS
================================================================================

**Local Kubernetes (Minikube):**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

**Production (Vercel):**
- Frontend: https://quizie-quiz.vercel.app
- Backend: https://quizie-backend.vercel.app/api
- Health Check: https://quizie-backend.vercel.app/api/health

**Docker Hub:**
- Backend: hub.docker.com/r/niranjanachar/quizie-backend
- Frontend: hub.docker.com/r/niranjanachar/quizie-frontend

**GitHub:**
- Repository: https://github.com/niranjan-achar/Quizie
- Actions: https://github.com/niranjan-achar/Quizie/actions

================================================================================
END OF DOCUMENT
================================================================================

This application demonstrates a complete modern DevOps workflow with:
- Automated CI/CD
- Containerization
- Orchestration
- Infrastructure as Code
- High Availability
- Self-Healing
- Cloud Deployment

All DevOps best practices implemented! 🚀
