# 🔑 How to Get Complete Clasp Credentials

## The Problem

Your `CLASP_CREDENTIALS` secret is **incomplete**. It needs ALL sections:

```json
{
  "token": { ... },                    ← You have this
  "oauth2ClientSettings": { ... },     ← MISSING!
  "isLocalCreds": false                ← MISSING!
}
```

---

## ✅ **Step-by-Step: Get Complete Credentials**

### **Method 1: GitHub Codespaces (Easiest on Phone)**

1. **On your phone**, go to: https://github.com/stephenborish/Quiz

2. Tap **Code** → **Codespaces** → **Create codespace on [your branch]**

3. **Wait for terminal** to appear at bottom (30-60 seconds)

4. **Run these commands one at a time:**

```bash
# Install clasp
npm install -g @google/clasp
```

```bash
# Login (this opens authorization)
clasp login --no-localhost
```

5. **Copy the URL** that appears (starts with `https://accounts.google.com...`)

6. **Open in NEW TAB** on your phone

7. **Sign in** with your Google account

8. **Click "Allow"** to grant permissions

9. **Copy the authorization code** (long string of letters/numbers)

10. **Go back to Codespaces** and **paste the code**, press Enter

11. **Get the COMPLETE credentials**:

```bash
cat ~/.clasprc.json
```

12. **SELECT ALL** the output (from the first `{` to the last `}`)

13. **Copy to clipboard** - this is your complete credentials!

---

## 📋 **What the Complete JSON Looks Like**

Your credentials should have **3 main sections**:

```json
{
  "token": {
    "access_token": "ya29.a0AfB_byD...",
    "refresh_token": "1//0gHZL_...",
    "scope": "https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script.webapp.deploy openid",
    "token_type": "Bearer",
    "expiry_date": 1738363889123
  },
  "oauth2ClientSettings": {
    "clientId": "1017190226189-kbkj4a8tjin31h8b4f4dv8gvf2hl5lbo.apps.googleusercontent.com",
    "clientSecret": "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",
    "redirectUri": "http://localhost"
  },
  "isLocalCreds": false
}
```

**Important:**
- Must start with `{`
- Must end with `}`
- Must include ALL THREE sections
- No extra quotes around the JSON
- No newlines except inside the JSON structure

---

## 🔄 **Update GitHub Secret**

1. Go to: https://github.com/stephenborish/Quiz/settings/secrets/actions

2. Click **CLASP_CREDENTIALS** (or create if doesn't exist)

3. Click **Update** (or **New repository secret**)

4. **Paste the COMPLETE JSON** you copied

5. Click **Update secret** (or **Add secret**)

---

## ✅ **Verify It's Complete**

Before saving, check your JSON has:

- [ ] Starts with `{`
- [ ] Has `"token"` section
- [ ] Has `"oauth2ClientSettings"` section
- [ ] Has `"isLocalCreds"` at the end
- [ ] Ends with `}`
- [ ] No extra quotes around it
- [ ] No backslashes like `\"`

---

## 🧪 **Test the Credentials**

After updating the secret:

1. Go to: https://github.com/stephenborish/Quiz/actions

2. Click **Deploy to Google Apps Script** workflow

3. Click **Run workflow**

4. Select branch: `claude/secure-integrated-web-app-eiWFM`

5. Click **Run workflow**

6. Wait ~1 minute

7. Should see **green checkmark** ✅

---

## 🚨 **Common Mistakes**

### ❌ Mistake 1: Only copying the "token" section
```json
{
  "token": {
    "access_token": "..."
  }
}
```
**Fix:** Copy ALL sections including `oauth2ClientSettings`

### ❌ Mistake 2: Adding extra quotes
```json
"{\"token\": ...}"
```
**Fix:** No quotes around the JSON, just raw JSON

### ❌ Mistake 3: Incomplete copy/paste
```json
{
  "token": { ... },
  "oauth2ClientSettings": {
    "clientId": "123
```
**Fix:** Make sure you copied to the final `}`

### ❌ Mistake 4: Wrong file
Looking at `~/.config/@google/clasprc.json` instead of `~/.clasprc.json`

**Fix:** Use `cat ~/.clasprc.json` (in home directory)

---

## 📱 **Quick Copy Method (Codespaces)**

In Codespaces terminal:

```bash
# Show complete file
cat ~/.clasprc.json

# Or copy to clipboard (if on computer)
cat ~/.clasprc.json | pbcopy    # Mac
cat ~/.clasprc.json | xclip     # Linux
```

On phone: **Tap and hold** in terminal, select all from `{` to `}`, copy

---

## 🔍 **Validate Your JSON**

Before pasting into GitHub:

1. Copy your JSON
2. Go to: https://jsonlint.com
3. Paste your JSON
4. Click **Validate JSON**
5. Should say "Valid JSON" ✅
6. If errors, fix them before updating secret

---

## 💡 **Pro Tip: Save It Somewhere Safe**

Once you get the complete credentials:

1. Save a copy in your phone's notes app
2. Label it "Clasp Credentials - GitHub Actions"
3. If you need to update the secret again, you'll have it ready

**Don't share it publicly!** This gives access to your Apps Script projects.

---

## 🆘 **Still Having Issues?**

### The credentials file doesn't exist

```bash
# Check if file exists
ls -la ~/.clasprc.json

# If not found, run login again
clasp login --no-localhost
```

### Login fails

```bash
# Try regular login (if on computer with browser)
clasp login

# Or use no-localhost flag (for phone/remote)
clasp login --no-localhost
```

### Can't access Codespaces

Alternative: Ask someone with a computer to:
1. Clone the repo
2. Run `clasp login`
3. Send you the contents of `~/.clasprc.json`

---

## 📞 **Quick Reference**

**Codespaces URL:** https://github.com/stephenborish/Quiz/codespaces
**Secrets URL:** https://github.com/stephenborish/Quiz/settings/secrets/actions
**Actions URL:** https://github.com/stephenborish/Quiz/actions
**JSON Validator:** https://jsonlint.com

---

**Last updated:** 2026-01-31
