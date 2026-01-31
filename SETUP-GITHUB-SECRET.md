# 🔑 Quick Setup: GitHub Secret for Auto-Deployment

## What You Need to Do (One Time Only)

You need to add your clasp credentials as a GitHub secret so GitHub Actions can deploy to Apps Script automatically.

---

## 📱 Easiest Method: GitHub Codespaces

### Step 1: Create a Codespace

1. On your phone, open: https://github.com/stephenborish/Quiz
2. Tap **Code** → **Codespaces** → **+ New codespace**
3. Wait for it to load (takes ~30 seconds)

### Step 2: Get Credentials

In the terminal at the bottom, run these commands:

```bash
# Install clasp
npm install -g @google/clasp

# Login (this opens a new tab)
clasp login --no-localhost
```

### Step 3: Authorize

1. Copy the URL shown in the terminal
2. Open it in a new tab
3. Sign in with your Google account
4. Click **Allow**
5. **Copy the authorization code**
6. Go back to the Codespace terminal
7. **Paste the code** and press Enter

### Step 4: Get the Credentials File

```bash
# Display your credentials
cat ~/.clasprc.json
```

**Copy the entire JSON output** (from `{` to `}`)

### Step 5: Add to GitHub Secrets

1. Go to: https://github.com/stephenborish/Quiz/settings/secrets/actions
2. Tap **New repository secret**
3. Name: `CLASP_CREDENTIALS`
4. Value: **Paste the JSON you copied**
5. Tap **Add secret**

---

## ✅ That's It!

Now whenever you push code to GitHub, it automatically deploys to Apps Script!

---

## 🔄 Alternative: Use Someone Else's Computer

If you have access to any computer:

```bash
# Install clasp
npm install -g @google/clasp

# Login
clasp login

# Get credentials (Mac/Linux)
cat ~/.clasprc.json

# Get credentials (Windows)
type %USERPROFILE%\.clasprc.json
```

Copy the JSON and add it to GitHub Secrets as shown above.

---

## 🎯 Testing the Setup

1. Make a small change to any file on GitHub
2. Commit it
3. Go to: https://github.com/stephenborish/Quiz/actions
4. Watch the deployment run
5. Green checkmark = success! ✅

---

## ⚠️ Troubleshooting

### "I don't see Settings tab"

You need **admin access** to the repository. If it's your repo, you should have access. Try the desktop site view.

### "Login isn't working"

Make sure you use `--no-localhost` flag:
```bash
clasp login --no-localhost
```

### "Can't find the credentials file"

**On Codespaces/Linux:**
```bash
cat ~/.clasprc.json
```

**On Mac:**
```bash
cat ~/.clasprc.json
```

**On Windows:**
```cmd
type %USERPROFILE%\.clasprc.json
```

### "JSON format error"

Make sure you copy the **entire** content including the outer `{ }` brackets.

Example format:
```json
{
  "token": {
    "access_token": "ya29...",
    "refresh_token": "1//...",
    "scope": "https://www.googleapis.com/auth/...",
    "token_type": "Bearer",
    "expiry_date": 1234567890000
  },
  "oauth2ClientSettings": {
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

---

## 🔒 Security

- This secret is **encrypted** by GitHub
- Only repository admins can see it
- It's never exposed in logs
- You can regenerate it anytime

---

## 📞 Quick Links

- **Add Secret**: https://github.com/stephenborish/Quiz/settings/secrets/actions
- **View Actions**: https://github.com/stephenborish/Quiz/actions
- **Your Apps Script**: https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit

---

**After setup, deployment is automatic!** Just commit code and GitHub deploys it for you. 🎉
