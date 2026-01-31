# 🚀 Deployment Guide - Secure Assessment Platform

## Quick Start

### One-Command Deployment

```bash
./deploy.sh
```

This will automatically push your code to Google Apps Script.

---

## Prerequisites

✅ **clasp** is already installed
✅ **Project configured** with Script ID: `1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb`

---

## First-Time Setup

### 1. Login to clasp

```bash
clasp login
```

This will:
- Open a browser window
- Ask you to authorize clasp
- Save credentials for future deployments

### 2. Verify Connection

```bash
clasp open
```

This opens your Apps Script project in the browser.

---

## Deployment Commands

### Push Code (Updates Only)

```bash
clasp push
```

Uploads `Code.gs` and `Index.html` to Apps Script.

### Push + Watch for Changes

```bash
clasp push --watch
```

Automatically pushes changes when you edit files locally.

### Deploy as Web App

```bash
clasp deploy --description "Production v2.0 - Security Hardening"
```

Creates a new deployment version.

### View Existing Deployments

```bash
clasp deployments
```

### View Logs

```bash
clasp logs
```

Shows recent execution logs from your Apps Script.

---

## NPM Scripts (Shortcuts)

We've configured convenient npm scripts:

```bash
# Push code to Apps Script
npm run deploy

# Push and watch for changes
npm run deploy:watch

# Open project in browser
npm run open

# View logs
npm run logs

# Full production deployment
npm run deploy:prod

# Pull latest from Apps Script
npm run pull

# Check status
npm run status
```

---

## Deployment Workflow

### 🔄 Standard Update Flow

1. **Make changes locally** to `Code.gs` or `Index.html`
2. **Test locally** (if possible)
3. **Push to Apps Script**:
   ```bash
   clasp push
   ```
4. **Test in Apps Script editor**:
   ```bash
   clasp open
   ```
5. **Deploy new version** (if all tests pass):
   ```bash
   clasp deploy --description "Updated security features"
   ```

### 🚨 Production Deployment Checklist

- [ ] All code tested locally
- [ ] Security features verified
- [ ] Firebase rules updated separately
- [ ] Backup current deployment
- [ ] Push code: `clasp push`
- [ ] Test in Apps Script editor
- [ ] Deploy: `clasp deploy --description "v2.0"`
- [ ] Test web app URL
- [ ] Monitor logs for errors

---

## Files Deployed

### ✅ Pushed to Apps Script
- `Code.gs` - Backend server functions
- `Index.html` - Frontend UI and client code

### ❌ NOT Pushed (managed separately)
- `firestore.rules` - Deploy via Firebase Console
- `storage.rules` - Deploy via Firebase Console
- `.git/` - Version control only
- `README.md` - Documentation
- `node_modules/` - Dependencies

See `.claspignore` for full exclusion list.

---

## Firebase Rules Deployment

Firebase security rules must be deployed separately:

### Using Firebase CLI

```bash
# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Click **Publish**
6. Repeat for **Storage** → **Rules**

---

## Troubleshooting

### "Not logged in"

```bash
clasp login
```

### "Script not found"

Verify `.clasp.json` has the correct Script ID:
```json
{
  "scriptId": "1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb"
}
```

### "Permission denied"

Make sure your Google account has edit access to the Apps Script project.

### "Push failed"

Check `.claspignore` - some files might be excluded.

### "Version mismatch"

Pull the latest version first:
```bash
clasp pull
```

---

## Advanced Usage

### Create New Deployment

```bash
clasp deploy --description "Version 2.1 - New Features"
```

### Undeploy Old Versions

```bash
# List deployments
clasp deployments

# Undeploy specific version
clasp undeploy <deploymentId>
```

### View Project Versions

```bash
clasp versions
```

### Create New Version

```bash
clasp version "Version 2.0 - Security Update"
```

---

## Environment Variables

You may need to configure Apps Script Properties:

### Script Properties (via Apps Script Editor)

1. Open project: `clasp open`
2. Go to **Project Settings** (gear icon)
3. Scroll to **Script Properties**
4. Add/update:
   - `FIREBASE_CONFIG`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_API_KEY`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `BOOTSTRAP_ADMIN_EMAIL`

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Apps Script

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g @google/clasp
      - run: clasp push
        env:
          CLASP_CREDS: ${{ secrets.CLASP_CREDENTIALS }}
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `clasp login` | Authenticate with Google |
| `clasp push` | Upload local files to Apps Script |
| `clasp pull` | Download Apps Script files locally |
| `clasp open` | Open project in browser |
| `clasp deploy` | Create new web app deployment |
| `clasp deployments` | List all deployments |
| `clasp logs` | View execution logs |
| `clasp status` | Check project status |

---

## Security Notes

- **Never commit** `.clasp.json` with credentials
- **Use environment variables** for sensitive data
- **Deploy Firebase rules** separately from Apps Script
- **Test deployments** in development first
- **Monitor logs** after deployment

---

## Support

- **clasp Documentation**: https://github.com/google/clasp
- **Apps Script Docs**: https://developers.google.com/apps-script
- **Firebase Rules**: https://firebase.google.com/docs/rules

---

Last updated: 2026-01-31
