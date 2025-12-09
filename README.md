# Environment-Aware Builds & Secrets Management in Production

This project demonstrates best practices for managing multi-environment deployments with secure secrets management for a Next.js application.

## 🎯 Project Overview

This setup includes:
- **Three separate environments**: Development, Staging, and Production
- **Secure secrets management** using GitHub Secrets (with alternatives for AWS Parameter Store and Azure Key Vault)
- **Environment-specific build configurations** for Next.js
- **Automated CI/CD pipeline** that handles different environments
- **Zero secrets in version control** - all sensitive data is externalized

---

## 📁 Project Structure

```
concept-2/
├── .github/
│   └── workflows/
│       └── multi-env-deploy.yml    # CI/CD pipeline for all environments
├── next-app/
│   ├── .env.development            # Development environment variables
│   ├── .env.staging                # Staging environment variables
│   ├── .env.production             # Production environment variables
│   ├── .env.example                # Template for environment variables
│   ├── scripts/
│   │   └── check-env.js            # Validation script for env variables
│   ├── next.config.ts              # Environment-aware Next.js config
│   └── package.json                # Build scripts for each environment
├── SECRETS_MANAGEMENT.md           # Guide for managing secrets
└── README.md                       # This file
```

---

## 🔧 Environment Configuration

### Development Environment (`.env.development`)
- **Purpose**: Local development on developer machines
- **API**: Points to `localhost:3001/api`
- **Database**: Local PostgreSQL or Docker container
- **Features**: Debug mode enabled, detailed logging, test API keys
- **Security**: Uses dummy/test credentials, not production-grade

### Staging Environment (`.env.staging`)
- **Purpose**: Pre-production testing and QA
- **API**: Points to `https://staging-api.yourapp.com/api`
- **Database**: Cloud-hosted staging database (AWS RDS, etc.)
- **Features**: Production-like but with test data, analytics enabled
- **Security**: Uses real but non-production credentials from secret managers

### Production Environment (`.env.production`)
- **Purpose**: Live application serving real users
- **API**: Points to `https://api.yourapp.com/api`
- **Database**: Production database with real user data
- **Features**: Optimized performance, minimal logging, rate limiting
- **Security**: Maximum security headers, strict HTTPS, production secrets

---

## 🚀 How to Run Different Environments

### Prerequisites

```bash
cd next-app
npm install
```

### Development Mode

```bash
npm run dev
# Uses .env.development by default
```

### Build for Specific Environments

```bash
# Build for development
npm run build:development

# Build for staging
npm run build:staging

# Build for production
npm run build:production
```

### Run Production Builds Locally

```bash
# Start staging build
npm run start:staging

# Start production build
npm run start:production
```

### Validate Environment Variables

```bash
npm run env:check
```

This script checks that all required environment variables are present before building.

---

## 🔐 Secrets Management Strategy

### ✅ What We Did Right

1. **No Secrets in Git**: All `.env.*` files are gitignored (except `.env.example`)
2. **GitHub Secrets**: Production secrets stored in GitHub repository secrets
3. **Environment Variables**: Sensitive data injected at build/runtime, never hardcoded
4. **Separation of Concerns**: Different secrets for each environment
5. **Template Provided**: `.env.example` shows required variables without exposing values

### 🔒 How Secrets Are Managed

#### GitHub Secrets (Primary Method)
Secrets are stored in GitHub and injected during CI/CD:

**Setup Steps**:
1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add secrets for each environment:
   - `DEV_DATABASE_URL`
   - `STAGING_DATABASE_URL`
   - `PROD_DATABASE_URL`
   - `STAGING_NEXTAUTH_SECRET`
   - `PROD_NEXTAUTH_SECRET`
   - etc.

3. CI/CD pipeline automatically injects these during builds:
```yaml
- name: Create .env.production
  run: |
    echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> .env.production
    echo "NEXTAUTH_SECRET=${{ secrets.PROD_NEXTAUTH_SECRET }}" >> .env.production
```

#### Alternative: AWS Systems Manager Parameter Store
Store secrets in AWS and retrieve them during deployment:

```bash
# Store secret
aws ssm put-parameter \
  --name "/myapp/production/database-url" \
  --value "postgresql://..." \
  --type "SecureString"

# Retrieve in CI/CD
DATABASE_URL=$(aws ssm get-parameter \
  --name "/myapp/production/database-url" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)
```

#### Alternative: Azure Key Vault
Store secrets in Azure and retrieve during deployment:

```bash
# Create Key Vault
az keyvault create --name myapp-kv --resource-group myapp-rg

# Add secret
az keyvault secret set \
  --vault-name myapp-kv \
  --name "DATABASE-URL" \
  --value "postgresql://..."
```

**See `SECRETS_MANAGEMENT.md` for detailed setup instructions.**

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/multi-env-deploy.yml`) automatically:

1. **Detects the environment** based on the branch:
   - `develop` → Development
   - `staging` → Staging  
   - `main` → Production

2. **Injects secrets** from GitHub Secrets into environment files

3. **Validates environment variables** using the check script

4. **Builds the application** with environment-specific configuration

5. **Runs linting and tests**

6. **Deploys** (placeholder - customize for your hosting platform)

### Branch Strategy

```
develop  → Development environment (auto-deploy)
   ↓
staging  → Staging environment (auto-deploy after review)
   ↓
main     → Production environment (manual approval required)
```

---

## 🏗️ Build Differences Across Environments

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| **API URL** | localhost:3001 | staging-api.yourapp.com | api.yourapp.com |
| **Debug Mode** | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| **Analytics** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Source Maps** | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| **Logging Level** | Debug | Info | Warn/Error |
| **Security Headers** | Basic | Enhanced | Maximum |
| **Rate Limiting** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Output** | Standard | Standard | Standalone (optimized) |

### Next.js Configuration Changes

The `next.config.ts` file dynamically adjusts based on `NEXT_PUBLIC_APP_ENV`:

- **Images**: Different allowed domains per environment
- **Headers**: Security headers applied in production only
- **Output**: Standalone output for production builds
- **React Strict Mode**: Enabled in all environments

---

## 🛡️ Security Best Practices Implemented

### ✅ What We Did

1. **Environment Variables**: All secrets stored as env vars, never in code
2. **GitHub Secrets**: Production credentials stored securely in GitHub
3. **Gitignore**: All `.env.*` files ignored except `.env.example`
4. **Validation**: Pre-build checks ensure all required variables are present
5. **Separation**: Different secrets for dev/staging/prod
6. **No Hardcoding**: API keys and tokens never appear in source code
7. **HTTPS Enforcement**: Production uses HSTS and strict transport security
8. **Secret Rotation**: Guidelines provided for regular secret updates

### ❌ What to Avoid

1. ❌ Never commit `.env.development`, `.env.staging`, or `.env.production`
2. ❌ Never hardcode API keys, database URLs, or passwords
3. ❌ Never use production credentials in development
4. ❌ Never expose secrets in logs or error messages
5. ❌ Never share `.env` files via email or chat

---

## 📊 How Environment-Specific Builds Improve CI/CD

### 1. **Consistency Across Environments**
Each environment has its own config, reducing "works on my machine" issues.

### 2. **Safe Testing**
Staging environment mirrors production without affecting real users or data.

### 3. **Controlled Rollouts**
Changes flow through dev → staging → production with proper testing.

### 4. **Quick Rollbacks**
If production fails, easy to rollback while keeping staging intact.

### 5. **Security Isolation**
Development credentials can't accidentally access production databases.

### 6. **Performance Optimization**
Production builds are optimized (minified, no source maps) while dev builds prioritize debugging.

---

## 📝 Reflection: Why Multi-Environment Setup Matters

### Challenges Faced

1. **Initial Complexity**: Setting up three separate environments felt overwhelming at first
   - **Solution**: Started with development, then gradually added staging and production

2. **Secret Management**: Deciding between GitHub Secrets, AWS, and Azure
   - **Solution**: Implemented GitHub Secrets as primary, documented alternatives

3. **Build Script Configuration**: Getting `dotenv-cli` to work correctly
   - **Solution**: Used `dotenv -e .env.{environment}` pattern for cross-platform compatibility

4. **CI/CD Integration**: Making GitHub Actions detect and use correct environment
   - **Solution**: Used branch-based conditional workflows

### Key Learnings

1. **Separation is Critical**: Never mix dev and prod credentials
2. **Automation Reduces Errors**: Manual deployments are error-prone
3. **Validation Saves Time**: Environment checks catch misconfigurations early
4. **Documentation Matters**: Clear docs help team members understand the setup

### Real-World Impact

This setup mirrors what companies like Netflix, Airbnb, and Stripe use:
- **Netflix**: Uses hundreds of micro-environments with strict secret management
- **Airbnb**: Separates staging and production with automated promotion pipelines
- **Stripe**: Uses environment-specific API keys to prevent test data in production

Multi-environment setups prevent:
- Accidental production data deletion during testing
- Exposing real user data to developers
- Service outages from untested code reaching production
- Security breaches from leaked credentials

---

## 🎥 Video Walkthrough

📹 **Video Link**: [Google Drive Link - Anyone with link can view]
<!-- Replace with your actual Google Drive video link -->

**Video Contents** (3-5 minutes):
- Overview of environment file setup
- Demonstration of secrets management in GitHub
- Live build comparison between environments
- Discussion of challenges and solutions

---

## 🧪 Testing the Setup

### Test Different Builds

```bash
# Terminal 1: Build staging
npm run build:staging

# Terminal 2: Build production
npm run build:production
```

### Verify Environment Loading

```bash
# Check what environment variables are loaded
npm run env:check
```

### Inspect Build Output

After building, check `.next/` folder:
- Staging and production should have optimized bundles
- Development should include source maps

---

## 📚 Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS Parameter Store Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)
- [12-Factor App Methodology](https://12factor.net/config)

---

## 👤 Author

**Your Name**  
Kalvium - WSI Part 2 - Concept 2

---

## ✅ Assignment Checklist

- [x] Created `.env.development`, `.env.staging`, `.env.production`
- [x] Created `.env.example` for documentation
- [x] Updated `.gitignore` to exclude environment files
- [x] Added environment-specific build scripts to `package.json`
- [x] Updated `next.config.ts` for environment-aware configuration
- [x] Created GitHub Actions CI/CD pipeline
- [x] Documented secrets management strategy
- [x] Created environment validation script
- [x] Verified no secrets are committed to Git
- [x] Documented build differences across environments
- [x] Written reflection on multi-environment benefits
- [ ] Recorded 3-5 minute video walkthrough
- [ ] Uploaded video to Google Drive with public link
- [ ] Tested all build commands successfully

---

## 🚀 Next Steps

After completing this assignment:

1. **Install dependencies**: `npm install` in the `next-app` folder
2. **Test builds**: Run each build command to ensure they work
3. **Set up GitHub Secrets**: Add your secrets to GitHub repository settings
4. **Record video**: Create your video walkthrough
5. **Submit**: Upload video link and submit assignment

---

## 📞 Support

If you encounter issues:
1. Check `.env.example` for required variables
2. Run `npm run env:check` to validate configuration
3. Review `SECRETS_MANAGEMENT.md` for setup guidance
4. Check GitHub Actions logs for CI/CD issues

---

**License**: MIT  
**Last Updated**: December 9, 2025
