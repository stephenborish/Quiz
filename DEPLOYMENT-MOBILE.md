# 📱 Mobile-Friendly Deployment Guide

**No computer needed!** Deploy to Google Apps Script from your phone.

---

## 🎯 How It Works

When you push code to GitHub from your phone, GitHub Actions automatically deploys it to Apps Script. That's it!

---

## ⚡ Quick Setup (One-Time)

### Step 1: Get Your Clasp Credentials

You need to do this **once** from any device with a browser:

#### Option A: Use GitHub Codespaces (Recommended)

1. On your phone, go to your GitHub repo
2. Tap **Code** → **Codespaces** → **Create codespace on [branch]**
3. Wait for the terminal to load
4. Run:
   ```bash
   npm install -g @google/clasp
   clasp login --no-localhost
   ```
5. Copy the URL and open in new tab
6. Authorize clasp
7. Copy the authorization code and paste it back
8. Get your credentials:
   ```bash
   cat ~/.clasprc.json
   ```
9. **Copy the entire JSON** (you'll need this for Step 2)

#### Option B: Use a Friend's Computer

1. Install clasp: `npm install -g @google/clasp`
2. Login: `clasp login`
3. Get credentials: `cat ~/.clasprc.json` (Mac/Linux) or `type %USERPROFILE%\.clasprc.json` (Windows)
4. Copy the JSON

#### Option C: Manual Apps Script Updates (No Setup)

Skip to "Manual Deployment" section below.

---

### Step 2: Add Credentials to GitHub Secrets

1. On your phone, go to your GitHub repo
2. Tap **Settings** (if you don't see it, you need admin access)
3. Scroll to **Secrets and variables** → **Actions**
4. Tap **New repository secret**
5. Name: `CLASP_CREDENTIALS`
6. Value: Paste the entire JSON from Step 1
7. Tap **Add secret**

**Example of what the JSON looks like:**
```json
{
  "token": {
    "access_token": "...",
    "refresh_token": "...",
    "scope": "...",
    "token_type": "Bearer",
    "expiry_date": 1234567890
  },
  "oauth2ClientSettings": {
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "..."
  },
  "isLocalCreds": false
}
```

---

## 🚀 How to Deploy (Every Time)

### Automatic Deployment (After Setup)

1. **Make changes** on your phone using GitHub mobile app or web editor
2. **Commit and push** to any branch (main or claude/*)
3. **GitHub Actions automatically deploys** to Apps Script
4. **Check the Actions tab** to see deployment status

### Manual Trigger

1. Go to your repo on GitHub
2. Tap **Actions**
3. Select **Deploy to Google Apps Script**
4. Tap **Run workflow**
5. Choose your branch
6. Tap **Run workflow**

---

## 📱 Editing Code on Your Phone

### Option 1: GitHub Mobile App

1. Download **GitHub** app (iOS/Android)
2. Open your repository
3. Navigate to `Code.gs` or `Index.html`
4. Tap the **pencil icon** to edit
5. Make your changes
6. Tap **Commit changes**
7. GitHub Actions automatically deploys!

### Option 2: GitHub Web Interface

1. Open github.com in your mobile browser
2. Go to your repository
3. Tap on the file to edit
4. Tap the **pencil icon**
5. Make changes
6. Scroll down and commit
7. Auto-deployment triggers!

### Option 3: GitHub Codespaces

1. Create a Codespace from your repo
2. Edit files in the web-based VS Code
3. Commit and push
4. Auto-deployment!

---

## 🔄 Manual Deployment (No GitHub Actions)

If you don't want to set up GitHub Actions:

### Via Apps Script Web Editor

1. Open [script.google.com](https://script.google.com) on your phone
2. Open your project (Script ID: `1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb`)
3. Select `Code.gs`
4. Copy content from your GitHub repo
5. Paste into Apps Script editor
6. Tap **Save** (disk icon)
7. Repeat for `Index.html`

**Pro tip**: Use split-screen on your phone - GitHub on one side, Apps Script on the other!

---

## 📊 Check Deployment Status

### On GitHub Mobile App

1. Open your repo
2. Tap **Actions** (bottom nav)
3. See latest deployment run
4. Tap to view logs
5. Green checkmark = successful deployment ✅

### On GitHub Web

1. Go to `https://github.com/[your-username]/Quiz/actions`
2. View deployment history
3. Click any run to see details

---

## 🔥 Deploy Firebase Rules from Phone

Firebase rules (firestore.rules, storage.rules) must be deployed separately:

### Via Firebase Console (Mobile-Friendly)

1. Open [console.firebase.google.com](https://console.firebase.google.com) on your phone
2. Select your project
3. **For Firestore Rules:**
   - Tap **Firestore Database**
   - Tap **Rules** tab
   - View your repo's `firestore.rules` file on GitHub
   - Copy the content
   - Paste into Firebase Console
   - Tap **Publish**

4. **For Storage Rules:**
   - Tap **Storage**
   - Tap **Rules** tab
   - Copy content from `storage.rules` on GitHub
   - Paste into Firebase Console
   - Tap **Publish**

---

## 🆘 Troubleshooting

### "Workflow not running"

1. Check **Actions** tab - is it enabled?
2. Verify you have the secret `CLASP_CREDENTIALS`
3. Make sure you pushed to `main` or `claude/*` branch

### "Deployment failed"

1. Check the Actions log for error details
2. Verify `CLASP_CREDENTIALS` secret is correct
3. Make sure your Google account has access to the Script ID

### "Can't find my script"

Your Script ID: `1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb`

Direct link: `https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit`

### "Secret not working"

Re-generate your clasp credentials:
1. Use GitHub Codespaces
2. Run `clasp login --no-localhost`
3. Copy new credentials
4. Update GitHub secret

---

## ⚡ Quick Workflow Summary

### Phone-Only Workflow

```
1. Edit file on GitHub (mobile app or browser)
   ↓
2. Commit changes
   ↓
3. GitHub Actions auto-deploys to Apps Script
   ↓
4. Check Actions tab for success ✅
   ↓
5. Test your web app!
```

---

## 🎨 Recommended Apps

For the best mobile experience:

- **GitHub Mobile** (iOS/Android) - Edit and commit code
- **Working Copy** (iOS) - Full Git client
- **Termux** (Android) - Run Git commands
- **Chrome/Safari** - Access GitHub Codespaces

---

## 🔐 Security Notes

- Never share your `CLASP_CREDENTIALS` secret
- GitHub Secrets are encrypted and secure
- Only admins can view secrets
- Rotate credentials if compromised

---

## 📞 Direct Links (Bookmark These!)

- **Your Apps Script**: https://script.google.com/d/1t0nNRgRA0bxkWgMEnrjTpGwL-dZHGyvsd7QWYidLk32mWp0FeBsElIZb/edit
- **GitHub Actions**: https://github.com/stephenborish/Quiz/actions
- **Firebase Console**: https://console.firebase.google.com
- **Your Repo**: https://github.com/stephenborish/Quiz

---

## ✅ You're All Set!

Once you complete the one-time setup:

1. ✏️ Edit code on GitHub (from your phone)
2. 💾 Commit changes
3. 🚀 Auto-deployed to Apps Script
4. ✅ Done!

No computer needed. Ever. 📱

---

**Questions?** Check the Actions logs or open an issue on GitHub!
