# Ansible Automation for Quizie

This directory contains Ansible playbooks for automating the deployment and management of the Quizie application.

## 📋 Prerequisites

```bash
# Install Ansible
pip install ansible
pip install kubernetes pyyaml jsonpatch

# Install required Ansible collections
ansible-galaxy collection install community.kubernetes
```

## 📁 Files

| Playbook | Purpose |
|----------|---------|
| `inventory.yaml` | Inventory file with hosts and groups |
| `playbook-setup-local.yaml` | Setup local dev environment (Docker, kubectl, Minikube, Helm) |
| `playbook-docker-build.yaml` | Build and push Docker images to Docker Hub |
| `playbook-deploy-k8s.yaml` | Deploy Quizie to Kubernetes cluster |

## 🚀 Quick Start

### 1. Setup Local Environment (First Time)

```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-setup-local.yaml
```

**What it does:**
- Installs Docker, kubectl, Minikube, and Helm
- Configures Docker to run without sudo
- Sets up Python Kubernetes module for Ansible

### 2. Start Minikube

```bash
minikube start --memory=8192 --cpus=4 --driver=docker
minikube status
```

### 3. Build and Push Docker Images

```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-docker-build.yaml \
  --extra-vars "docker_username=YOUR_USERNAME docker_password=YOUR_PASSWORD git_commit=$(git rev-parse --short HEAD)"
```

**Environment variables alternative:**
```bash
export DOCKER_USERNAME="niranjanachar"
export DOCKER_PASSWORD="your-docker-token"

ansible-playbook -i ansible/inventory.yaml ansible/playbook-docker-build.yaml \
  --extra-vars "docker_username=$DOCKER_USERNAME docker_password=$DOCKER_PASSWORD git_commit=latest"
```

**What it does:**
- Builds backend Docker image
- Builds frontend Docker image
- Pushes both to Docker Hub
- Creates tags with git commit hash and 'latest'

### 4. Deploy to Kubernetes

```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml
```

**What it does:**
- Creates `quizie` namespace
- Creates Secrets (MongoDB credentials, API keys)
- Creates ConfigMaps (environment variables)
- Applies all Kubernetes manifests:
  - MongoDB StatefulSet
  - Backend Deployment (2 replicas)
  - Frontend Deployment (2 replicas)
  - Services
- Waits for all pods to be Running
- Displays deployment status

### 5. Access the Application

```bash
# Terminal 1: Frontend port-forward
kubectl port-forward -n quizie svc/frontend-service 3000:80

# Terminal 2: Backend port-forward
kubectl port-forward -n quizie svc/backend-service 5000:5000
```

Access at: **http://localhost:3000**

## 📊 Complete Automated Deployment (All Steps)

```bash
#!/bin/bash

# 1. Setup local environment
echo "Step 1: Setting up local environment..."
ansible-playbook -i ansible/inventory.yaml ansible/playbook-setup-local.yaml

# 2. Start Minikube
echo "Step 2: Starting Minikube..."
minikube start --memory=8192 --cpus=4 --driver=docker
sleep 30

# 3. Build and push images
echo "Step 3: Building and pushing Docker images..."
ansible-playbook -i ansible/inventory.yaml ansible/playbook-docker-build.yaml \
  --extra-vars "docker_username=niranjanachar docker_password=$DOCKER_PASSWORD git_commit=latest"

# 4. Deploy to Kubernetes
echo "Step 4: Deploying to Kubernetes..."
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml

echo "✓ Deployment complete! Start port-forwards and access at http://localhost:3000"
```

## 🔍 Useful Ansible Commands

### Check playbook syntax
```bash
ansible-playbook ansible/playbook-deploy-k8s.yaml --syntax-check
```

### Run with verbose output
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml -v
```

### Run with extra verbosity
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml -vvv
```

### Run specific tags only
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml --tags "namespace,secrets"
```

### List hosts and groups
```bash
ansible-inventory -i ansible/inventory.yaml --list
ansible-inventory -i ansible/inventory.yaml --graph
```

### Test connectivity
```bash
ansible -i ansible/inventory.yaml kubernetes -m ping
```

## 🔐 Secrets Management

### For Local Development
Secrets are created with default values. Update them:

```bash
kubectl edit secret mongodb-secret -n quizie
kubectl edit secret api-secrets -n quizie
```

### For Production
Store credentials in a secure vault:

```bash
# Using Ansible Vault
ansible-vault create secrets.yml
# Add your secrets, then:
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml \
  --ask-vault-pass
```

## 📝 Kubernetes Manifest Files

The playbooks apply these manifests:
- `k8s/namespace.yaml` - Kubernetes namespace
- `k8s/secrets.yaml` - Secret definitions
- `k8s/configmaps.yaml` - ConfigMap definitions
- `k8s/mongodb-statefulset.yaml` - MongoDB database
- `k8s/backend-deployment.yaml` - Backend API (2 replicas)
- `k8s/frontend-deployment.yaml` - React frontend (2 replicas)
- `k8s/services.yaml` - Kubernetes services

## 🛠️ Troubleshooting

### Image Pull Errors
If using local Minikube images:
```bash
# Load image into Minikube
minikube image load niranjanachar/quizie-frontend:local

# Update imagePullPolicy to Never in deployment
```

### Pod Stuck in Pending
```bash
kubectl describe pod <pod-name> -n quizie
kubectl get events -n quizie
```

### View Application Logs
```bash
# Backend logs
kubectl logs -n quizie -l app=backend -f

# Frontend logs
kubectl logs -n quizie -l app=frontend -f

# MongoDB logs
kubectl logs -n quizie -l app=mongodb -f
```

### Reset Everything
```bash
kubectl delete namespace quizie
# Minikube automatically stops when you stop it:
minikube stop
minikube delete
```

## 📈 Advanced Features

### Multi-environment Support
Create separate inventory files:
- `inventory-dev.yaml` - Development (Minikube)
- `inventory-staging.yaml` - Staging (Real K8s)
- `inventory-prod.yaml` - Production (Real K8s)

```bash
ansible-playbook -i ansible/inventory-prod.yaml ansible/playbook-deploy-k8s.yaml
```

### Custom Variables
Pass custom values via command line:
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml \
  --extra-vars "project_name=quizie-v2 docker_username=myrepo"
```

### Dry Run (Check Mode)
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml --check
```

## 📚 Next Steps

After deployment:
1. **Phase 8**: Setup ArgoCD for GitOps (automatic deployments from git)
2. **Phase 10**: Add HTTPS with cert-manager and Let's Encrypt
3. **Phase 7**: Setup public access with Ingress and DuckDNS
4. **Phase 11**: Prepare demo and viva questions

## 💡 Tips

- Always test playbooks with `--check` first
- Use `--tags` to run specific parts
- Set `ANSIBLE_PYTHON_INTERPRETER` if you have multiple Python versions
- Keep sensitive data in Ansible Vault
- Version control your inventory and playbooks

---

**Questions?** Check the main [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for system design details.
