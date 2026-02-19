# GitHub → Apps Script Auto-Deploy Setup

This repo now includes a GitHub Actions workflow that builds the app and pushes to Google Apps Script via `clasp`.

## What the workflow does

On every push to `main` (or manual dispatch):

1. Installs dependencies
2. Builds the app (`npm run build`)
3. Prepares Apps Script artifacts (`npm run deploy:gas`)
4. Authenticates `clasp` using GitHub secrets
5. Pushes `dist/*` to your Apps Script project

Workflow file: `.github/workflows/deploy-apps-script.yml`

## Required GitHub Secrets

Set these in **GitHub → Settings → Secrets and variables → Actions**:

### `APPS_SCRIPT_SCRIPT_ID`
Your Apps Script project ID (the long ID from Script Editor URL).

### `CLASP_CREDENTIALS_JSON`
A JSON string containing your `.clasprc.json` content.

Typical structure:

```json
{
  "token": {
    "access_token": "...",
    "refresh_token": "...",
    "scope": "https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/service.management",
    "token_type": "Bearer",
    "expiry_date": 1735689600000
  },
  "oauth2ClientSettings": {
    "clientId": "...apps.googleusercontent.com",
    "clientSecret": "...",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

> Keep this secret private. It grants deploy access to your Apps Script project.

## First-time local extraction of credentials

If needed, on your local machine:

1. `npm i -g @google/clasp`
2. `clasp login`
3. Open `~/.clasprc.json`
4. Copy full JSON into `CLASP_CREDENTIALS_JSON` secret

## Triggering deploy

- Automatic: push to `main`
- Manual: Actions tab → **Deploy to Google Apps Script** → **Run workflow**
