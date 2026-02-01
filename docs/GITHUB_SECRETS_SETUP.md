# GitHub Actions Secrets Setup Guide

## 🔐 Required Secrets for CI/CD Pipeline

Before GitHub Actions can build and push Docker images, you MUST configure these secrets.

================================================================================
## STEP 1: GITHUB REPOSITORY SECRETS
================================================================================

### Navigate to GitHub Secrets:
1. Go to: https://github.com/niranjan-achar/Quizie
2. Click **Settings** (top right)
3. In left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

================================================================================
## STEP 2: DOCKER HUB CREDENTIALS (REQUIRED)
================================================================================

### Secret 1: DOCKER_USERNAME
```
Name: DOCKER_USERNAME
Value: niranjanachar
```

**How to get:**
- This is your Docker Hub username
- Already have it: niranjanachar

---

### Secret 2: DOCKER_PASSWORD
```
Name: DOCKER_PASSWORD
Value: <your-docker-hub-access-token>
```

**How to get Docker Hub Access Token:**

1. Go to: https://hub.docker.com
2. Login with your credentials
3. Click your **username** (top right) → **Account Settings**
4. Click **Security** (left sidebar)
5. Click **New Access Token**
6. Fill in:
   - Description: `GitHub Actions Quizie`
   - Access permissions: **Read, Write, Delete**
7. Click **Generate**
8. **COPY THE TOKEN** (you won't see it again!)
9. Paste this token as DOCKER_PASSWORD in GitHub

⚠️ **IMPORTANT**: Use Access Token, NOT your Docker Hub password!

================================================================================
## STEP 3: VERIFY SECRETS ARE SET
================================================================================

After adding secrets, you should see:

```
Repository secrets (2)
├── DOCKER_USERNAME
└── DOCKER_PASSWORD
```

Click on each to verify (you'll see ******* for the value)

================================================================================
## STEP 4: HOW GITHUB ACTIONS USES THESE SECRETS
================================================================================

In your workflow file `.github/workflows/ci-pipeline.yaml`:

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

**What happens:**
1. GitHub Actions reads secrets securely
2. Logs into Docker Hub
3. Builds images
4. Pushes to your Docker Hub account

================================================================================
## STEP 5: OPTIONAL SECRETS (FOR FUTURE USE)
================================================================================

These are NOT required for CI/CD, but needed for runtime:

### For Kubernetes Deployment (set in K8s Secrets, not GitHub):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JSON Web Token secret
- `GROK_API_KEY` - Grok AI API key

**Note**: These are already configured in Kubernetes as secrets, not GitHub!

================================================================================
## COMPLETE SETUP CHECKLIST
================================================================================

### ✅ GitHub Secrets (Required for CI/CD):
- [ ] DOCKER_USERNAME added
- [ ] DOCKER_PASSWORD (access token) added

### ✅ Test CI/CD:
```bash
# Make a small change and push
cd /home/niranjan/Devops/Quizie
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

### ✅ Verify GitHub Actions:
1. Go to: https://github.com/niranjan-achar/Quizie/actions
2. Check the latest workflow run
3. Should see "Build and Push Docker Images" running
4. Wait ~5-7 minutes
5. Should complete successfully ✅

### ✅ Verify Docker Hub:
1. Go to: https://hub.docker.com/r/niranjanachar/quizie-backend/tags
2. Should see new tag with latest commit hash
3. Go to: https://hub.docker.com/r/niranjanachar/quizie-frontend/tags
4. Should see new tag with latest commit hash

================================================================================
## TROUBLESHOOTING
================================================================================

### Error: "unauthorized: incorrect username or password"
**Solution**: You're using password instead of access token
- Generate new access token from Docker Hub
- Update DOCKER_PASSWORD secret in GitHub

### Error: "denied: requested access to the resource is denied"
**Solution**: Access token doesn't have write permissions
- Generate new token with "Read, Write, Delete" permissions
- Update DOCKER_PASSWORD secret

### Error: "Secret not found"
**Solution**: Secret name doesn't match
- Check spelling: DOCKER_USERNAME (not DOCKERHUB_USERNAME)
- Check spelling: DOCKER_PASSWORD (not DOCKER_TOKEN)
- Names are case-sensitive

### Workflow not triggering?
**Solution**: 
- Check workflow file exists: .github/workflows/ci-pipeline.yaml
- Check trigger: should be `on: push: branches: [main]`
- Check you pushed to main branch (not other branch)

================================================================================
## SECURITY BEST PRACTICES
================================================================================

✅ **DO:**
- Use Docker Hub Access Tokens (not passwords)
- Rotate tokens every 90 days
- Use specific permissions (not full access)
- Never commit secrets to git
- Use GitHub Secrets for sensitive data

❌ **DON'T:**
- Commit Docker Hub password to git
- Share access tokens publicly
- Use same token across multiple projects
- Store secrets in code or .env files in git

================================================================================
## QUICK REFERENCE
================================================================================

### GitHub Secrets Location:
```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
```

### Docker Hub Token Location:
```
Docker Hub → Account Settings → Security → New Access Token
```

### Workflow File:
```
.github/workflows/ci-pipeline.yaml
```

### Test Push:
```bash
git add .
git commit -m "test: CI/CD pipeline"
git push origin main
```

### Check Status:
```
https://github.com/niranjan-achar/Quizie/actions
```

================================================================================
## CURRENT STATUS CHECK
================================================================================

Run this to see if secrets are configured:

```bash
# Check if workflow file exists
ls -la .github/workflows/ci-pipeline.yaml

# Make a test push
git log -1 --oneline

# Push will trigger GitHub Actions (if secrets are set)
```

If secrets are NOT set, GitHub Actions will fail with:
```
Error: Username and password required
```

If secrets ARE set, GitHub Actions will:
```
✓ Login to Docker Hub
✓ Build images
✓ Push to Docker Hub
```

================================================================================
END OF GUIDE
================================================================================

**Next Steps:**
1. Add DOCKER_USERNAME and DOCKER_PASSWORD to GitHub Secrets
2. Make a test commit and push
3. Watch GitHub Actions run successfully
4. Verify images on Docker Hub

Your CI/CD pipeline will be fully automated! 🚀
