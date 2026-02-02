# 🔧 Deployment Troubleshooting Guide

## Common GitHub Actions Errors

### Error: "Cannot read properties of undefined (reading 'access_token')"

**Cause:** The `CLASP_CREDENTIALS` secret has invalid JSON format.

**Solution:**

1. **Get fresh credentials** using GitHub Codespaces:

```bash
# In Codespaces terminal
npm install -g @google/clasp
clasp login --no-localhost
```

2. **Copy the authorization URL** and authorize in your browser

3. **Get the credentials file**:

```bash
cat ~/.clasprc.json
```

4. **Verify it's valid JSON** - it should look like this:

```json
{
  "token": {
    "access_token": "ya29.a0...",
    "refresh_token": "1//0g...",
    "scope": "https://www.googleapis.com/auth/...",
    "token_type": "Bearer",
    "expiry_date": 1234567890123
  },
  "oauth2ClientSettings": {
    "clientId": "1234567890-abc123xyz.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-abc123...",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

5. **Update GitHub Secret**:
   - Go to: https://github.com/stephenborish/Quiz/settings/secrets/actions
   - Click on `CLASP_CREDENTIALS`
   - Click **Update**
   - Paste the **entire JSON** (including outer `{}`)
   - Click **Update secret**

---

### Error: "Could not read API credentials"

**Cause:** Clasp can't find the credentials file.

**Solution:** Already fixed in latest workflow. Make sure you're using the updated `.github/workflows/deploy-apps-script.yml`.

---

### Error: "Push failed" or "Permission denied"

**Cause:** Your Google account doesn't have access to the Apps Script project.

**Solution:**

1. Open Apps Script project: https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit
2. Check if you can edit the project
3. If not, ask the project owner to add you as an editor

---

### Error: "Invalid JSON in CLASP_CREDENTIALS secret"

**Cause:** The JSON has syntax errors or special characters weren't copied correctly.

**Common mistakes:**

❌ **Missing outer braces**
```
"token": {
  "access_token": "..."
}
```

✅ **Correct format**
```json
{
  "token": {
    "access_token": "..."
  }
}
```

❌ **Extra quotes or escaping**
```json
"{\"token\": ...}"
```

✅ **Raw JSON (no escaping)**
```json
{"token": ...}
```

❌ **Newlines in wrong places**
```json
{
"token":
{
```

✅ **Valid JSON formatting**
```json
{
  "token": {
```

**How to fix:**

1. Copy your `~/.clasprc.json` again carefully
2. Use a JSON validator: https://jsonlint.com
3. Paste into validator to check for errors
4. Update GitHub secret with validated JSON

---

## Testing Your Credentials

### Test Locally (If you have a computer)

```bash
# Save credentials to file
echo 'YOUR_JSON_HERE' > ~/.clasprc.json

# Test authentication
clasp login --status

# Try pushing
cd /path/to/Quiz
clasp push
```

### Test in GitHub Codespaces

```bash
# Create credentials file
echo 'YOUR_JSON_HERE' > ~/.clasprc.json

# Verify JSON format
cat ~/.clasprc.json | jq .

# Test clasp
clasp push
```

---

## Getting Help

### Check GitHub Actions Logs

1. Go to: https://github.com/stephenborish/Quiz/actions
2. Click the failed workflow run
3. Click "Create clasprc.json" step
4. Look for specific error messages

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `Cannot read properties of undefined` | Invalid JSON | Recopy credentials |
| `Could not read API credentials` | File not found | Fixed in latest workflow |
| `User has not enabled the Apps Script API` | API not enabled | Enable at console.developers.google.com |
| `Permission denied` | No access to script | Request editor access |
| `Refresh token has expired` | Credentials expired | Run `clasp login` again |

---

## Step-by-Step: Getting Fresh Credentials

### Using GitHub Codespaces (Recommended)

1. **On your phone**, go to: https://github.com/stephenborish/Quiz
2. Tap **Code** → **Codespaces** → **Create codespace**
3. Wait for terminal to appear
4. Run:
   ```bash
   npm install -g @google/clasp
   clasp login --no-localhost
   ```
5. **Copy the URL** that appears
6. **Open in new tab** and authorize
7. **Copy the authorization code**
8. **Paste back** in Codespaces terminal
9. Get your credentials:
   ```bash
   cat ~/.clasprc.json
   ```
10. **Select all the JSON** (from `{` to `}`)
11. **Copy** to clipboard

### Add to GitHub

1. Go to: https://github.com/stephenborish/Quiz/settings/secrets/actions
2. Find `CLASP_CREDENTIALS`
3. Click **Update**
4. **Paste** the JSON
5. Click **Update secret**

### Verify It Works

1. Go to: https://github.com/stephenborish/Quiz/actions
2. Click **Deploy to Google Apps Script**
3. Click **Run workflow**
4. Select your branch
5. Click **Run workflow**
6. Wait for green checkmark ✅

---

## Manual Deployment (Fallback)

If GitHub Actions isn't working, you can still deploy manually:

### From Phone (Copy/Paste Method)

1. Open: https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit
2. View your GitHub repo files
3. Copy `Code.gs` content from GitHub
4. Paste into Apps Script `Code.gs`
5. Save (💾 icon)
6. Repeat for `Index.html`

### From Codespaces

1. Create Codespace
2. Install clasp: `npm install -g @google/clasp`
3. Login: `clasp login --no-localhost`
4. Push: `clasp push`

---

## Credential Security

### ✅ Safe Practices
- Store credentials in GitHub Secrets
- Never commit `.clasprc.json` to git
- Rotate credentials if compromised
- Use minimal scopes

### ❌ Don't Do This
- Post credentials in issues
- Share credentials via email
- Commit to public repos
- Use personal credentials for team projects

---

## Still Having Issues?

1. **Check workflow file is updated**:
   https://github.com/stephenborish/Quiz/blob/claude/secure-integrated-web-app-eiWFM/.github/workflows/deploy-apps-script.yml

2. **Verify secret exists**:
   https://github.com/stephenborish/Quiz/settings/secrets/actions

3. **Check Apps Script access**:
   https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit

4. **Enable Apps Script API**:
   https://console.developers.google.com/apis/api/script.googleapis.com

---

Last updated: 2026-01-31
