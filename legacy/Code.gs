/*** Secure Assessment Platform - Server Backend (Code.gs)
 * ======================================================
 *
 * Google Apps Script Web App serving as the serverless backend.
 * Features:
 * - Secure config injection from PropertiesService
 * - Dynamic RBAC via Firestore authorized_teachers lookup
 * - Session-based authentication via Google Workspace
 *
 * Setup Instructions:
 * 1. Go to Project Settings > Script Properties
 * 2. Add the following properties:
 *    - FIREBASE_CONFIG: JSON string of Firebase web config
 *    - FIREBASE_PROJECT_ID: Your Firebase project ID
 *    - FIREBASE_API_KEY: Firebase Web API Key (for REST calls)
 *
 * Deployment:
 * - Execute as: Anyone (the accessing user)
 * - Who has access: Anyone
 *
 * @version 2.0.0
 */

// ============================================
// CONFIGURATION
// ============================================

/**
 * Application metadata
 */
const APP_CONFIG = {
  title: 'Secure Assessment Platform',
  version: '2.0.0',
  organization: 'Malvern Prep',
  appUrl: 'https://script.google.com/macros/s/AKfycbxQlfAJyBNknabLSYZP4bzyjUFfqdwqWMSt3K42wU-J/exec'
};

/**
 * Cache duration for teacher authorization checks (seconds)
 * Reduces Firestore reads for repeated requests
 */
const AUTH_CACHE_DURATION = 300; // 5 minutes

/**
 * Normalize email for consistent doc IDs and auth claims.
 *
 * @param {string} email - Raw user email.
 * @returns {string} Normalized email.
 */
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

// ============================================
// MAIN WEB APP ENTRY POINT
// ============================================

/**
 * doGet - Main entry point for the Web App
 *
 * Flow:
 * 1. Authenticate user via Google Workspace
 * 2. Retrieve Firebase config from Script Properties
 * 3. Check if user is authorized teacher via Firestore
 * 4. Inject variables and serve the HTML
 *
 * @param {Object} e - Event object with request parameters
 * @returns {HtmlOutput} - Rendered HTML page
 */
function doGet(e) {
  try {
    // ----------------------------------------
    // STEP 1: Authenticate User
    // ----------------------------------------
    const activeUser = Session.getActiveUser();
    const userEmail = normalizeEmail(activeUser.getEmail());

    if (!userEmail || userEmail === '') {
      return createErrorPage('Authentication Required',
        'Please sign in with your Google account to access this application.');
    }

    console.log(`[ACCESS] User authenticated: ${userEmail}`);

    // ----------------------------------------
    // STEP 2: Retrieve Firebase Configuration
    // ----------------------------------------
    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig) {
      console.error('[ERROR] Firebase configuration not found in Script Properties');
      return createErrorPage('Configuration Error',
        'The application is not properly configured. Please contact your administrator.');
    }

    // ----------------------------------------
    // STEP 3: Dynamic RBAC - Check Teacher Authorization
    // ----------------------------------------
    const isTeacher = checkTeacherAuthorization(userEmail);
    const userRole = isTeacher ? 'TEACHER' : 'STUDENT';

    console.log(`[RBAC] User: ${userEmail}, Role: ${userRole}`);

    // ----------------------------------------
    // STEP 4: Create and Serve Template
    // ----------------------------------------
    const template = HtmlService.createTemplateFromFile('index');

    // Generate auth token with error handling
    let authToken = '';
    let authTokenError = '';
    try {
      authToken = getFirebaseToken(userEmail, isTeacher);
      console.log('[AUTH] Token generated successfully, length:', authToken.length);
    } catch (tokenError) {
      console.error('[AUTH] Token generation failed:', tokenError.toString());
      authTokenError = tokenError.message || 'Token generation failed';
    }

    // ----------------------------------------
    // STEP 5: Bundle and Base64 Encode all Variables
    // ----------------------------------------
    const dataBundle = {
      userEmail: userEmail,
      isTeacher: isTeacher,
      userRole: userRole,
      firebaseConfig: firebaseConfig,
      appTitle: APP_CONFIG.title,
      appVersion: APP_CONFIG.version,
      appUrl: APP_CONFIG.appUrl || ScriptApp.getService().getUrl(),
      authToken: authToken,
      authTokenError: authTokenError,
      serverTimestamp: new Date().toISOString()
    };
    
    // Inject the entire bundle as a single Base64 string, stripping any newlines
    const rawB64 = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(dataBundle)).getBytes());
    template.injectedData = rawB64.replace(/\r?\n|\r/g, '');

    return template.evaluate()
      .setTitle(APP_CONFIG.title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .addMetaTag('mobile-web-app-capable', 'yes')
      .addMetaTag('apple-mobile-web-app-capable', 'yes');

  } catch (error) {
    console.error('[ERROR] doGet failed:', error.toString(), error.stack);
    return createErrorPage('Application Error',
      'An unexpected error occurred. Please refresh and try again.',
      error.toString() + '\n' + error.stack);
  }
}

// ============================================
// FIREBASE CONFIGURATION
// ============================================

/**
 * Retrieves Firebase configuration from Script Properties
 * NEVER hardcode API keys in source code
 *
 * @returns {Object|null} Firebase config object or null if not found
 */
function getFirebaseConfig() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const configJson = scriptProperties.getProperty('FIREBASE_CONFIG');

    if (!configJson) {
      console.error('[CONFIG] FIREBASE_CONFIG not found in Script Properties');
      return null;
    }

    const config = JSON.parse(configJson);

    // Validate required fields
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
    for (const field of requiredFields) {
      if (!config[field]) {
        console.error(`[CONFIG] Missing required field: ${field}`);
        return null;
      }
    }

    return config;

  } catch (error) {
    console.error('[CONFIG] Failed to parse Firebase config:', error);
    return null;
  }
}

/**
 * Gets the Firebase project ID from Script Properties
 *
 * @returns {string|null} Project ID or null
 */
function getFirebaseProjectId() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('FIREBASE_PROJECT_ID');
}

/**
 * Gets the Firebase API key from Script Properties
 *
 * @returns {string|null} API key or null
 */
function getFirebaseApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('FIREBASE_API_KEY');
}

// ============================================
// DYNAMIC RBAC - TEACHER AUTHORIZATION
// ============================================

/**
 * Checks if a user is an authorized teacher
 * Uses Firestore REST API to query authorized_teachers collection
 *
 * @param {string} email - User's email address
 * @returns {boolean} True if user is an authorized teacher
 */
function checkTeacherAuthorization(email) {
  const normalizedEmail = normalizeEmail(email);
  // Check cache first
  const cache = CacheService.getScriptCache();
  const cacheKey = `teacher_auth_${normalizedEmail}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult !== null) {
    console.log(`[RBAC] Cache hit for ${normalizedEmail}: ${cachedResult}`);
    return cachedResult === 'true';
  }

  // Query Firestore
  const isAuthorized = queryFirestoreForTeacher(normalizedEmail);

  // Cache the result
  cache.put(cacheKey, isAuthorized.toString(), AUTH_CACHE_DURATION);
  console.log(`[RBAC] Firestore query for ${normalizedEmail}: ${isAuthorized}`);

  return isAuthorized;
}

/**
 * Queries Firestore REST API to check if email exists in authorized_teachers
 *
 * @param {string} email - User's email to check
 * @returns {boolean} True if document exists
 */
function queryFirestoreForTeacher(email) {
  try {
    const projectId = getFirebaseProjectId();

    if (!projectId) {
      console.error('[RBAC] Missing Firebase project ID');
      // Fallback: Check against hardcoded bootstrap admin
      return checkBootstrapAdmin(email);
    }

    // Use Service Account Token
    const accessToken = getServiceAccountAccessToken();

    // Firestore REST API endpoint
    // Document path: authorized_teachers/{email}
    const documentPath = `authorized_teachers/${encodeURIComponent(normalizeEmail(email))}`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`;

    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      // Document exists - user is authorized
      return true;
    } else if (statusCode === 404) {
      // Document not found - user is not authorized
      return false;
    } else {
      console.error(`[RBAC] Firestore API error: ${statusCode} - ${response.getContentText()}`);
      // On error, fallback to bootstrap admin check
      return checkBootstrapAdmin(email);
    }

  } catch (error) {
    console.error('[RBAC] Failed to query Firestore:', error);
    // Fallback to bootstrap admin
    return checkBootstrapAdmin(email);
  }
}

/**
 * Bootstrap admin check - fallback when Firestore is unavailable
 * This allows initial setup before authorized_teachers collection exists
 *
 * IMPORTANT: Set BOOTSTRAP_ADMIN_EMAIL in Script Properties
 *
 * @param {string} email - Email to check
 * @returns {boolean} True if bootstrap admin
 */
function checkBootstrapAdmin(email) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const bootstrapAdmin = scriptProperties.getProperty('BOOTSTRAP_ADMIN_EMAIL');

  if (bootstrapAdmin && email.toLowerCase() === bootstrapAdmin.toLowerCase()) {
    console.log('[RBAC] Bootstrap admin access granted');
    return true;
  }

  return false;
}

/**
 * Invalidates the authorization cache for a specific user
 * Call this when teacher status changes
 *
 * @param {string} email - Email to invalidate
 */
function invalidateAuthCache(email) {
  const cache = CacheService.getScriptCache();
  const normalizedEmail = normalizeEmail(email);
  cache.remove(`teacher_auth_${normalizedEmail}`);
  console.log(`[RBAC] Cache invalidated for ${normalizedEmail}`);
}

/**
 * Clears all authorization cache
 * Useful for admin operations
 */
function clearAllAuthCache() {
  // Note: CacheService doesn't support clearing all keys
  // This is a placeholder for documentation
  console.log('[RBAC] Manual cache clear requested');
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Creates a styled error page
 *
 * @param {string} title - Error title
 * @param {string} message - Error description
 * @param {string} [debugInfo] - Optional technical details for debugging
 * @returns {HtmlOutput} Styled error page
 */
function createErrorPage(title, message, debugInfo) {
  const errorHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - ${APP_CONFIG.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          padding: 20px;
        }
        .error-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 50px 40px;
          text-align: center;
          max-width: 800px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .error-icon {
          font-size: 72px;
          margin-bottom: 25px;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 15px;
          color: #ff6b6b;
        }
        p {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 30px;
        }
        .debug-info {
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          text-align: left;
          font-family: monospace;
          font-size: 12px;
          color: #ff6b6b;
          white-space: pre-wrap;
          margin-bottom: 30px;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
          border-left: 3px solid #ff6b6b;
        }
        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 35px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .support {
          margin-top: 25px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>${title}</h1>
        <p>${message}</p>
        ${debugInfo ? `<div class="debug-info">${debugInfo}</div>` : ''}
        <button class="btn" onclick="location.reload()">Try Again</button>
        <div class="support">
          Need help? Contact your system administrator.
        </div>
      </div>
    </body>
    </html>
  `;

  const output = HtmlService.createHtmlOutput(errorHtml);
  output.setTitle('Error - ' + APP_CONFIG.title);
  output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}

// ============================================
// HTML INCLUDE UTILITY
// ============================================

/**
 * Include function for modular HTML
 * Usage in HTML: <?!= include('filename') ?>
 *
 * @param {string} filename - Name of file to include (without .html)
 * @returns {string} File contents
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// SERVER-SIDE API (Called from client)
// ============================================

/**
 * Gets current user email (can be called from client)
 *
 * @returns {string} User's email
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Checks if current user is a teacher (can be called from client)
 * Uses cached authorization check
 *
 * @returns {boolean} True if teacher
 */
function checkIsTeacher() {
  const email = Session.getActiveUser().getEmail();
  return checkTeacherAuthorization(email);
}

/**
 * Gets server timestamp for synchronization
 *
 * @returns {string} ISO timestamp
 */
function getServerTimestamp() {
  return new Date().toISOString();
}

/**
 * Logs an audit event (called from client for important actions)
 *
 * @param {string} action - Action description
 * @param {Object} details - Additional details
 * @returns {Object} Result with timestamp
 */
function logAuditEvent(action, details) {
  const email = Session.getActiveUser().getEmail();
  const timestamp = new Date().toISOString();

  console.log(`[AUDIT] ${timestamp} | ${email} | ${action} | ${JSON.stringify(details || {})}`);

  return { success: true, timestamp: timestamp };
}

/**
 * Lists documents for a given Firestore collection path using OAuth.
 *
 * @param {string} collectionPath - Firestore collection path (e.g., courses/{id}/roster)
 * @returns {Array<Object>} Array of document objects
 */
function listFirestoreDocuments(collectionPath) {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error('Missing Firebase project ID.');
  }

  const accessToken = getServiceAccountAccessToken();
  const documents = [];
  let pageToken = null;

  do {
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?pageSize=500`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      throw new Error(`Firestore list failed: ${statusCode} - ${response.getContentText()}`);
    }

    const payload = JSON.parse(response.getContentText());
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || null;
  } while (pageToken);

  return documents;
}

/**
 * Sends quiz invite emails to roster students.
 *
 * @param {string} quizId - Quiz document ID
 * @param {string} courseId - Course document ID
 * @returns {Object} Result with sent count
 */
function sendQuizInvites(quizId, courseId) {
  const userEmail = normalizeEmail(Session.getActiveUser().getEmail());

  if (!quizId || !courseId) {
    throw new Error('Missing quizId or courseId.');
  }

  if (!checkTeacherAuthorization(userEmail)) {
    throw new Error('Unauthorized.');
  }

  // Rate limiting: 1 minute cooldown between sends for same quiz
  const cache = CacheService.getScriptCache();
  const rateLimitKey = `invite_sent_${quizId}`;
  const lastSent = cache.get(rateLimitKey);

  if (lastSent) {
    const lastSentTime = parseInt(lastSent, 10);
    const now = Date.now();
    const cooldownMs = 60000; // 1 minute
    const elapsed = now - lastSentTime;

    if (elapsed < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before sending invites again.`);
    }
  }

  const rosterDocs = listFirestoreDocuments(`courses/${courseId}/roster`);
  const appUrl = APP_CONFIG.appUrl || ScriptApp.getService().getUrl();
  const quizLink = `${appUrl}?quiz=${encodeURIComponent(quizId)}`;

  let sent = 0;
  const maxRecipients = 100; // Prevent accidental spam

  rosterDocs.forEach((doc) => {
    // Enforce max recipients limit
    if (sent >= maxRecipients) {
      return;
    }

    const fields = doc.fields || {};
    const emailField = fields.email && fields.email.stringValue ? fields.email.stringValue : '';
    const rosterEmail = emailField || doc.name.split('/').pop();
    const nameField = fields.name && fields.name.stringValue ? fields.name.stringValue : '';

    if (!rosterEmail || !rosterEmail.includes('@')) {
      return;
    }

    try {
      const subject = `Quiz Invite: ${APP_CONFIG.title}`;
      const greeting = nameField ? `Hello ${nameField},` : 'Hello,';
      const body = `${greeting}\n\n` +
        `You have been invited to take a quiz. Use the link below to access the quiz:\n\n` +
        `${quizLink}\n\n` +
        `If the quiz is not open yet, you will see the waiting screen until your teacher opens it.\n\n` +
        `Thank you.`;

      MailApp.sendEmail(rosterEmail, subject, body);
      sent += 1;
    } catch (emailError) {
      console.error(`[INVITES] Failed to send to ${rosterEmail}:`, emailError);
      // Continue with other emails
    }
  });

  // Record this send time for rate limiting
  cache.put(rateLimitKey, Date.now().toString(), 120); // Cache for 2 minutes

  return { success: true, sent: sent };
}

// ============================================
// ADMIN UTILITIES
// ============================================

/**
 * Sets up initial Firebase configuration
 * Run this once from the Apps Script editor
 *
 * @param {Object} config - Firebase config object
 */
function setupFirebaseConfig(config) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('FIREBASE_CONFIG', JSON.stringify(config));
  scriptProperties.setProperty('FIREBASE_PROJECT_ID', config.projectId);
  scriptProperties.setProperty('FIREBASE_API_KEY', config.apiKey);
  console.log('[SETUP] Firebase configuration saved');
}

/**
 * Sets the bootstrap admin email
 * This user will have admin access even if Firestore is unavailable
 *
 * @param {string} email - Admin email
 */
function setBootstrapAdmin(email) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('BOOTSTRAP_ADMIN_EMAIL', email);
  console.log('[SETUP] Bootstrap admin set to:', email);
}

/**
 * Test function to verify configuration
 * Run from Apps Script editor
 */
function testConfiguration() {
  console.log('=== Configuration Test ===');

  // Test Firebase config
  const config = getFirebaseConfig();
  console.log('Firebase Config:', config ? 'Found' : 'MISSING');
  if (config) {
    console.log('  Project ID:', config.projectId);
  }

  // Test user session
  const email = normalizeEmail(Session.getActiveUser().getEmail());
  console.log('Current User:', email || 'Not authenticated');

  // Test teacher check
  if (email) {
    const isTeacher = checkTeacherAuthorization(email);
    console.log('Is Teacher:', isTeacher);
  }

  console.log('=== Test Complete ===');
}

/**
 * Displays current Script Properties (for debugging)
 * WARNING: Contains sensitive data - use carefully
 */
function showScriptProperties() {
  const props = PropertiesService.getScriptProperties().getProperties();
  for (const key in props) {
    if (key.includes('KEY') || key.includes('SECRET')) {
      console.log(`${key}: [REDACTED]`);
    } else {
      console.log(`${key}: ${props[key]}`);
    }
  }
}


// --- PASTE AT BOTTOM OF Code.gs ---
function getFirebaseToken(userEmail, isTeacher) {
  const p = PropertiesService.getScriptProperties();
  const privateKey = p.getProperty('FIREBASE_PRIVATE_KEY');
  const clientEmail = p.getProperty('FIREBASE_CLIENT_EMAIL');

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Firebase service account credentials in Script Properties.');
  }

  const key = privateKey.replace(/\\n/g, '\n');
  const email = normalizeEmail(clientEmail);
  const normalizedUserEmail = normalizeEmail(userEmail);
  
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({alg:'RS256',typ:'JWT'})).replace(/=/g,'');
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: email, sub: email, aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+3600,
    uid: normalizedUserEmail.replace(/[.#$\/\[\]]/g, '_'), 
    claims: { email: normalizedUserEmail, teacher: isTeacher }
  })).replace(/=/g,'');
  
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(header+'.'+payload, key)).replace(/=/g,'');
  return header + '.' + payload + '.' + signature;
}

/**
 * Generates a Google OAuth2 Access Token using the Service Account.
 * Bypasses USER_BLOCKED_BY_ADMIN errors by acting as the Service Account.
 */
function getServiceAccountAccessToken() {
  const p = PropertiesService.getScriptProperties();
  const privateKey = p.getProperty('FIREBASE_PRIVATE_KEY');
  const clientEmail = p.getProperty('FIREBASE_CLIENT_EMAIL');

  if (!privateKey || !clientEmail) {
    throw new Error('Service Account credentials missing in Script Properties.');
  }

  const key = privateKey.replace(/\\n/g, '\n');
  
  // JWT for OAuth2 Token Exchange
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const claimSet = JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  });
  
  const payload = Utilities.base64EncodeWebSafe(claimSet);
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(header + '.' + payload, key));
  const jwt = header + '.' + payload + '.' + signature;

  // Exchange JWT for Access Token
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    },
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  if (!json.access_token) {
    throw new Error('Failed to obtain Access Token: ' + JSON.stringify(json));
  }
  
  return json.access_token;
}

/**
 * Run this function in the editor to trigger the authorization prompt
 * for the new 'datastore' scope.
 */
function testFirestoreScopes() {
  console.log('Testing Firestore scopes...');
  try {
    const projectId = getFirebaseProjectId();
    if (!projectId) throw new Error('No project ID');
    
    // Attempt a simple list to trigger scope check
    console.log('Attempting auth via Service Account...');
    const docs = listFirestoreDocuments('authorized_teachers');
    console.log('Success! Connection verified.');
    console.log('Found docs:', docs.length);
  } catch (e) {
    console.error('Scope Test Failed:', e);
    throw e;
  }
}
