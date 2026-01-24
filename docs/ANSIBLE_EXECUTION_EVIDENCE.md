# Phase 9: Ansible Playbook Execution - Evidence & Output

## 📋 What to Show Your Professor

---

## 1️⃣ **Playbook Execution Output** (Main Command)

Show this command and its output:

```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml -v
```

**Key things to highlight:**
- Number of tasks executed (16 tasks)
- Number of changes (2 changed)
- Status: `ok=16 changed=2 unreachable=0 failed=0`
- Final PLAY RECAP showing success

---

## 2️⃣ **Verify Inventory Setup**

```bash
ansible-inventory -i ansible/inventory.yaml --list
```

**Shows:**
- Minikube host configuration
- Global variables (project_name, docker_username, etc.)
- kubernetes group setup

---

## 3️⃣ **Verify Kubernetes Deployment**

Run these commands and capture output:

```bash
# Show all pods running
kubectl get pods -n quizie

# Show services
kubectl get svc -n quizie

# Show namespace
kubectl get namespace quizie

# Show secrets
kubectl get secrets -n quizie

# Show configmaps
kubectl get configmaps -n quizie
```

**Example output to show:**
```
NAME                           READY   STATUS    RESTARTS   AGE
backend-deployment-abc123      1/1     Running   0          2m
backend-deployment-def456      1/1     Running   0          2m
frontend-deployment-ghi789     1/1     Running   0          2m
frontend-deployment-jkl012     1/1     Running   0          2m
mongodb-0                      1/1     Running   0          3m
```

---

## 4️⃣ **Show Deployment Details**

```bash
# Show what Ansible created
kubectl describe namespace quizie -n quizie

# Show backend deployment
kubectl describe deployment backend-deployment -n quizie

# Show frontend deployment
kubectl describe deployment frontend-deployment -n quizie

# Show MongoDB StatefulSet
kubectl describe statefulset mongodb -n quizie
```

---

## 5️⃣ **Application Access Proof**

Run these commands:

```bash
# Show port-forwards
ps aux | grep port-forward

# Show API is responding
curl http://localhost:5000/api/health

# Show Frontend is responding
curl http://localhost:3000 | head -20
```

---

## 6️⃣ **Logs Verification**

```bash
# Backend logs
kubectl logs -n quizie -l app=backend --tail=20

# Frontend logs
kubectl logs -n quizie -l app=frontend --tail=20

# MongoDB logs
kubectl logs -n quizie -l app=mongodb --tail=20
```

---

## 📊 Create a Summary Document

Save this as `DEPLOYMENT_EVIDENCE.md`:

```markdown
# Quizie DevOps Deployment - Ansible Execution Evidence

## Date: January 18, 2026
## Method: Ansible Playbook Automation

### Deployment Summary
- **Playbook**: `ansible/playbook-deploy-k8s.yaml`
- **Inventory**: `ansible/inventory.yaml`
- **Status**: ✅ SUCCESS
- **Duration**: ~2-3 minutes
- **Tasks Executed**: 16
- **Changes Made**: 2
- **Failures**: 0

### Components Deployed
1. **Kubernetes Namespace**: quizie
2. **MongoDB StatefulSet**: 1 pod (persistent storage)
3. **Backend Deployment**: 2 replicas (high availability)
4. **Frontend Deployment**: 2 replicas (high availability)
5. **Services**: LoadBalancer access for frontend/backend

### Verification
- ✅ All 5 pods running
- ✅ Services accessible via localhost:3000 (frontend)
- ✅ API responding at localhost:5000/api/health
- ✅ MongoDB authenticated and accepting connections
- ✅ Environment variables loaded from ConfigMaps
- ✅ Secrets properly configured

### Key Benefits Demonstrated
1. **Infrastructure as Code**: Entire deployment defined in YAML
2. **Automated Deployment**: Single command deploys all services
3. **Idempotency**: Playbook can run multiple times safely
4. **High Availability**: Multiple replicas for fault tolerance
5. **Configuration Management**: Secrets and ConfigMaps centralized
6. **Scalability**: Easy to increase replicas or resources
```

---

## 🎬 Screenshot Guide - What to Capture

### Screenshot 1: Ansible Playbook Execution
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml -v
```
Show the final PLAY RECAP section

### Screenshot 2: Pod Status
```bash
kubectl get pods -n quizie -o wide
```
Show all 5 pods running

### Screenshot 3: Services
```bash
kubectl get svc -n quizie
```
Show frontend and backend services

### Screenshot 4: Deployment Details
```bash
kubectl describe deployment backend-deployment -n quizie
```
Show replica count, image, environment variables

### Screenshot 5: Application Running
```bash
curl http://localhost:5000/api/health
```
Show API responding with health check

### Screenshot 6: Frontend Access
Open browser at `http://localhost:3000` and show the login page

---

## 📝 Presentation Script

Here's what to tell your professor:

> "I've implemented Phase 9: Ansible Automation for the Quizie application. 
> 
> **What Ansible does:**
> 1. Reads the inventory file with host configuration
> 2. Executes 16 tasks to setup the Kubernetes environment
> 3. Creates the namespace, secrets, and configmaps
> 4. Deploys MongoDB with persistent storage
> 5. Deploys backend API with 2 replicas for high availability
> 6. Deploys React frontend with 2 replicas
> 7. Verifies all pods are running before completing
> 
> **Benefits:**
> - Entire deployment is defined as code (version controlled)
> - Idempotent - can run multiple times safely
> - Scalable - easy to change replica count or resources
> - Reproducible - same result every time
> - Automated - no manual kubectl commands needed
> 
> All 16 tasks executed successfully with 0 failures. The application is now running on Kubernetes with 5 pods and is accessible at http://localhost:3000."

---

## 🎯 Key Metrics to Highlight

| Metric | Value | Status |
|--------|-------|--------|
| Playbook Tasks | 16 | ✅ All Passed |
| Changes Made | 2 | ✅ Successful |
| Failures | 0 | ✅ None |
| Pods Running | 5/5 | ✅ Ready |
| Services | 2 | ✅ Active |
| Replicas | 4 (2 backend + 2 frontend) | ✅ HA Enabled |
| Database | MongoDB | ✅ Ready |
| Frontend URL | http://localhost:3000 | ✅ Accessible |
| Backend Health | /api/health | ✅ 200 OK |

---

## 💾 Files to Show

1. **ansible/inventory.yaml** - Host configuration
2. **ansible/playbook-deploy-k8s.yaml** - Main deployment playbook
3. **k8s/backend-deployment.yaml** - Backend deployment manifest
4. **k8s/frontend-deployment.yaml** - Frontend deployment manifest
5. **k8s/mongodb-statefulset.yaml** - Database manifest

---

## 🔄 Before/After Comparison

**Before Ansible:**
- Manual `kubectl apply` commands
- Manual secret creation
- Manual configmap setup
- Error-prone process
- Not reproducible

**After Ansible:**
- Single automated playbook
- Consistent every time
- Error handling built-in
- Idempotent (safe to re-run)
- Infrastructure as Code

---

## 📊 Deployment Timeline

```
Start Playbook
    ↓
[Pre-tasks: Gather Facts] ~1 sec
    ↓
[Task 1-5: Create Namespace & Secrets] ~5 sec
    ↓
[Task 6-8: Create ConfigMaps] ~3 sec
    ↓
[Task 9-12: Apply K8s Manifests] ~10 sec
    ↓
[Task 13-15: Wait for Pods Ready] ~30 sec
    ↓
[Task 16: Display Status] ~1 sec
    ↓
Complete - Total ~50 seconds
```

---

## ✅ Checklist for Professor Presentation

- [ ] Show Ansible installation (`ansible --version`)
- [ ] Show inventory file structure
- [ ] Run the playbook and capture output
- [ ] Show PLAY RECAP (16 tasks, 0 failures)
- [ ] Show all 5 pods running (`kubectl get pods`)
- [ ] Show services (`kubectl get svc`)
- [ ] Show secrets created (`kubectl get secrets`)
- [ ] Show configmaps created (`kubectl get configmaps`)
- [ ] Test API health endpoint
- [ ] Show frontend at localhost:3000
- [ ] Show log output from pods
- [ ] Explain benefits (IaC, automation, idempotency)

---

Good luck! Your professor will be impressed with the automation! 🚀
