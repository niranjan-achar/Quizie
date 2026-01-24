# Phase 9: Ansible Automation - Implementation Guide

## 🎯 Overview

Ansible provides **Infrastructure as Code (IaC)** automation to:
- Setup local development environment
- Build and push Docker images
- Deploy to Kubernetes
- Manage configurations
- Scale applications

## ✅ What We've Implemented

### 1. **inventory.yaml** - Host Configuration
```yaml
- Minikube local environment
- Global variables (project name, Docker username, etc.)
- kubernetes group for task execution
```

### 2. **playbook-setup-local.yaml** - Environment Setup
Installs on your local machine:
- ✓ Docker (with non-root access)
- ✓ kubectl (Kubernetes CLI)
- ✓ Minikube (local K8s cluster)
- ✓ Helm (package manager)
- ✓ Python Kubernetes module (for Ansible)

### 3. **playbook-docker-build.yaml** - Container Builds
Automates Docker workflow:
- ✓ Build backend image
- ✓ Build frontend image
- ✓ Tag with commit hash and 'latest'
- ✓ Push to Docker Hub

### 4. **playbook-deploy-k8s.yaml** - Kubernetes Deployment
Deploys entire application:
- ✓ Create namespace
- ✓ Create Secrets (MongoDB, API keys)
- ✓ Create ConfigMaps (environment)
- ✓ Deploy MongoDB StatefulSet
- ✓ Deploy Backend (2 replicas)
- ✓ Deploy Frontend (2 replicas)
- ✓ Wait for all pods to be Running
- ✓ Display status

## 🚀 Step-by-Step Execution

### Step 1: Check Ansible Installation
```bash
ansible --version
ansible-galaxy collection list community.kubernetes
```

### Step 2: Setup Local Environment (First Time Only)
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-setup-local.yaml
```

**Output includes:**
- Docker version
- kubectl version
- Minikube version
- Helm version

### Step 3: Verify Minikube
```bash
minikube status
minikube ip
```

### Step 4: Build and Push Images
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-docker-build.yaml \
  --extra-vars "docker_username=niranjanachar docker_password=YOUR_TOKEN git_commit=latest"
```

**Note:** Get Docker token from Docker Hub account settings

### Step 5: Deploy to Kubernetes
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml
```

**Output includes:**
- Namespace created
- Secrets created
- ConfigMaps created
- All manifests applied
- Pod status verification
- Port-forward instructions

### Step 6: Port-Forward and Access
```bash
# Terminal 1
kubectl port-forward -n quizie svc/frontend-service 3000:80

# Terminal 2
kubectl port-forward -n quizie svc/backend-service 5000:5000
```

Visit: **http://localhost:3000**

## 📊 Ansible Concepts Used

### Hosts & Groups
```yaml
minikube_local:
  hosts:
    minikube:
      ansible_host: 127.0.0.1
      ansible_connection: local
```

### Variables
```yaml
vars:
  project_name: quizie
  docker_username: niranjanachar
```

### Tasks
```yaml
tasks:
  - name: Create namespace
    kubernetes.core.k8s:
      name: quizie
      kind: Namespace
      state: present
```

### Handlers
```yaml
handlers:
  - name: Restart deployment
    kubernetes.core.k8s:
      state: present
```

### Filters
```yaml
until: backend_pods.resources | length >= 2
register: backend_pods
```

## 🔄 Common Ansible Commands

### Syntax Check
```bash
ansible-playbook ansible/playbook-deploy-k8s.yaml --syntax-check
```

### Verbose Output
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml -v
```

### Check Mode (Dry Run)
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml --check
```

### List Hosts
```bash
ansible-inventory -i ansible/inventory.yaml --list
```

### Ping Hosts
```bash
ansible -i ansible/inventory.yaml kubernetes -m ping
```

## 📝 Key Variables & Secrets

### ConfigMap (Non-sensitive)
```yaml
MONGODB_URI: mongodb://admin:Ninja%40321@mongodb-service:27017/quiz-system
NODE_ENV: production
LOG_LEVEL: info
```

### Secrets (Sensitive)
```yaml
mongodb_username: admin
mongodb_password: Ninja@321
GROK_API_KEY: grok-default-key-change-this
JWT_SECRET: jwt-secret-key-change-this
```

**Important:** Change these values in production!

## 🎓 How It Works

### 1. Inventory Resolution
Ansible reads `inventory.yaml` and identifies:
- Target hosts (minikube)
- Connection method (local)
- User account

### 2. Playbook Execution
Each playbook runs tasks sequentially:
1. Pre-tasks (setup)
2. Main tasks (implementation)
3. Post-tasks (cleanup)
4. Handlers (triggered changes)

### 3. Module Execution
Ansible modules perform actions:
- `kubernetes.core.k8s` - Kubernetes operations
- `command` - Run shell commands
- `apt` - Package management
- `systemd` - Service management

### 4. Idempotency
Tasks can run multiple times safely:
- Creates only if doesn't exist
- Updates if configuration differs
- Returns `changed: false` if already correct

## 🚦 Deployment Flow

```
playbook-setup-local.yaml
  ├─ Install Docker
  ├─ Install kubectl
  ├─ Install Minikube
  └─ Install Helm

playbook-docker-build.yaml
  ├─ Build backend image
  ├─ Build frontend image
  └─ Push to Docker Hub

playbook-deploy-k8s.yaml
  ├─ Create namespace
  ├─ Create secrets
  ├─ Create configmaps
  ├─ Deploy MongoDB
  ├─ Deploy backend
  ├─ Deploy frontend
  └─ Verify all pods Running
```

## 💡 Tips & Best Practices

1. **Always check syntax first**
   ```bash
   ansible-playbook playbook.yaml --syntax-check
   ```

2. **Run in check mode before executing**
   ```bash
   ansible-playbook playbook.yaml --check
   ```

3. **Use verbose output for debugging**
   ```bash
   ansible-playbook playbook.yaml -vvv
   ```

4. **Keep credentials in vault**
   ```bash
   ansible-vault create secrets.yml
   ansible-playbook playbook.yaml --ask-vault-pass
   ```

5. **Test idempotency** - Run playbook twice, second run should show `changed: false`

## 🔐 Security Considerations

### For Development
- Store dummy credentials in playbooks
- Update via `kubectl edit` for actual values

### For Production
- Use Ansible Vault for sensitive data
- Use external secret managers (HashiCorp Vault, AWS Secrets)
- Never commit real credentials to git
- Rotate credentials regularly

## 📈 Advanced Extensions

### Multi-environment Support
Create separate inventory files:
```bash
ansible-playbook -i ansible/inventory-prod.yaml ansible/playbook-deploy-k8s.yaml
```

### Custom Variables
```bash
ansible-playbook -i ansible/inventory.yaml ansible/playbook-deploy-k8s.yaml \
  --extra-vars "docker_username=myrepo replicas=5"
```

### Conditional Tasks
```yaml
- name: Task
  when: ansible_os_family == "Debian"
```

### Loop Tasks
```yaml
- name: Create services
  kubernetes.core.k8s:
    definition: "{{ item }}"
  loop: "{{ services }}"
```

## 🎯 What's Next

After Ansible setup:
1. **Phase 8**: ArgoCD - Automatic GitOps deployments
2. **Phase 10**: HTTPS with cert-manager
3. **Phase 7**: Public access with Ingress
4. **Phase 11**: Demo & viva preparation

---

**Status:** ✅ Phase 9 Complete - Ansible automation fully configured and documented
