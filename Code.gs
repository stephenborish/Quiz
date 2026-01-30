/**
 * Secure Assessment Platform - Server-Side Backend
 * =================================================
 *
 * Google Apps Script Web App serving as the serverless backend.
 * Handles authentication, template injection, and secure serving.
 *
 * Deployment Settings:
 * - Execute as: Me (the developer)
 * - Who has access: Anyone within [Organization] OR Anyone
 * - Note: For Google Workspace, use domain-restricted access
 *
 * @author Generated for Malvern Prep
 * @version 1.0.0
 */

// ============================================
// CONFIGURATION CONSTANTS
// ============================================

/**
 * Teacher/Admin email - SINGLE SOURCE OF TRUTH
 * This user has full administrative privileges
 * Must match the email in Firestore Security Rules
 */
const TEACHER_EMAIL = 'sborish@malvernprep.org';

/**
 * Application metadata
 */
const APP_CONFIG = {
  title: 'Secure Assessment Platform',
  version: '1.0.0',
  organization: 'Malvern Prep',
  supportEmail: 'sborish@malvernprep.org'
};

// ============================================
// MAIN WEB APP ENTRY POINT
// ============================================

/**
 * doGet - Main entry point for the Web App
 *
 * This function is triggered when the Web App URL is accessed.
 * It performs the following:
 * 1. Captures the user's identity securely from Google Workspace
 * 2. Determines if the user is a teacher or student
 * 3. Injects necessary variables into the HTML template
 * 4. Serves the compiled HTML with proper security settings
 *
 * @param {Object} e - Event object containing request parameters
 * @returns {HtmlOutput} - The rendered HTML page
 */
function doGet(e) {
  try {
    // ----------------------------------------
    // STEP 1: Secure User Authentication
    // ----------------------------------------
    // Session.getActiveUser() returns the user's Google account
    // This is cryptographically secure and cannot be spoofed
    // Returns empty string if accessed outside of Google Workspace context
    const activeUser = Session.getActiveUser();
    const userEmail = activeUser.getEmail();

    // Handle edge case: No authenticated user
    // This can happen if script permissions aren't properly configured
    if (!userEmail || userEmail === '') {
      return createErrorPage('Authentication Error',
        'Unable to verify your identity. Please ensure you are signed into your Google account and try again.');
    }

    // ----------------------------------------
    // STEP 2: Role Determination
    // ----------------------------------------
    // Compare user email against the designated teacher email
    // Case-insensitive comparison for robustness
    const isTeacher = (userEmail.toLowerCase() === TEACHER_EMAIL.toLowerCase());

    // Determine initial mode based on role
    // - Teachers start in 'dashboard' mode
    // - Students start in 'waiting' mode (until exam opens)
    const initialMode = isTeacher ? 'dashboard' : 'waiting';

    // Log access for auditing (visible in Apps Script Logs)
    console.log(`[ACCESS] User: ${userEmail}, Role: ${isTeacher ? 'TEACHER' : 'STUDENT'}, Mode: ${initialMode}`);

    // ----------------------------------------
    // STEP 3: Template Creation & Variable Injection
    // ----------------------------------------
    // Create template from Index.html file
    const template = HtmlService.createTemplateFromFile('Index');

    // Inject server-side variables into the template
    // These become available as <?= variableName ?> in the HTML
    // CRITICAL: These values are computed server-side and cannot be tampered with
    template.userEmail = userEmail;
    template.isTeacher = isTeacher;
    template.initialMode = initialMode;

    // Additional metadata injection
    template.appTitle = APP_CONFIG.title;
    template.appVersion = APP_CONFIG.version;
    template.serverTimestamp = new Date().toISOString();

    // ----------------------------------------
    // STEP 4: Evaluate Template & Configure Output
    // ----------------------------------------
    // Evaluate the template (processes <?= ?> scriptlets)
    const htmlOutput = template.evaluate();

    // Set page title
    htmlOutput.setTitle(APP_CONFIG.title);

    // CRITICAL SECURITY SETTING: XFrameOptionsMode
    // ALLOWALL permits embedding in iframes (needed for some LMS integrations)
    // If you don't need iframe embedding, use SAMEORIGIN for better security
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    // Set viewport for mobile/Chromebook compatibility
    // This ensures proper rendering on various screen sizes
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

    // Additional meta tags for PWA-like behavior
    htmlOutput.addMetaTag('mobile-web-app-capable', 'yes');
    htmlOutput.addMetaTag('apple-mobile-web-app-capable', 'yes');
    htmlOutput.addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    return htmlOutput;

  } catch (error) {
    // Log error for debugging
    console.error('[ERROR] doGet failed:', error.toString(), error.stack);

    // Return user-friendly error page
    return createErrorPage('Application Error',
      'An unexpected error occurred. Please try again or contact support.');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates an error page with consistent styling
 *
 * @param {string} title - Error title
 * @param {string} message - Error message to display
 * @returns {HtmlOutput} - Styled error page
 */
function createErrorPage(title, message) {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
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
        }
        .error-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 500px;
          margin: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #ff6b6b;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 25px;
        }
        .retry-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .support-link {
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        .support-link a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <button class="retry-btn" onclick="location.reload()">Try Again</button>
        <div class="support-link">
          Need help? Contact <a href="mailto:${APP_CONFIG.supportEmail}">${APP_CONFIG.supportEmail}</a>
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

/**
 * Include function for modular HTML
 * Allows splitting HTML into multiple files if needed
 *
 * Usage in HTML: <?!= include('Filename') ?>
 *
 * @param {string} filename - Name of the file to include (without .html)
 * @returns {string} - Contents of the file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// SERVER-SIDE API FUNCTIONS (Called from client)
// ============================================

/**
 * Gets the current user's email
 * Can be called from client-side JavaScript via google.script.run
 *
 * @returns {string} - User's email address
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Checks if the current user is a teacher
 *
 * @returns {boolean} - True if user is the designated teacher
 */
function checkIsTeacher() {
  const email = Session.getActiveUser().getEmail();
  return email.toLowerCase() === TEACHER_EMAIL.toLowerCase();
}

/**
 * Gets server timestamp
 * Useful for synchronizing client time with server
 *
 * @returns {string} - ISO formatted timestamp
 */
function getServerTimestamp() {
  return new Date().toISOString();
}

/**
 * Logs an audit event
 * Creates a record in the Apps Script logs
 *
 * @param {string} action - The action being logged
 * @param {Object} details - Additional details about the action
 */
function logAuditEvent(action, details) {
  const email = Session.getActiveUser().getEmail();
  const timestamp = new Date().toISOString();

  console.log(`[AUDIT] ${timestamp} | ${email} | ${action} | ${JSON.stringify(details)}`);

  return {
    success: true,
    timestamp: timestamp
  };
}

// ============================================
// DEVELOPMENT & TESTING UTILITIES
// ============================================

/**
 * Test function to verify deployment
 * Run this from the Apps Script editor to test configuration
 */
function testDeployment() {
  console.log('=== Deployment Test ===');
  console.log('Teacher Email:', TEACHER_EMAIL);
  console.log('App Config:', JSON.stringify(APP_CONFIG));

  // Test user detection
  const email = Session.getActiveUser().getEmail();
  console.log('Current User:', email);
  console.log('Is Teacher:', email.toLowerCase() === TEACHER_EMAIL.toLowerCase());

  // Test template
  try {
    const template = HtmlService.createTemplateFromFile('Index');
    console.log('Template loaded successfully');
  } catch (e) {
    console.error('Template error:', e);
  }

  console.log('=== Test Complete ===');
}

/**
 * Utility to get script properties
 * For debugging deployment issues
 */
function getDeploymentInfo() {
  return {
    scriptId: ScriptApp.getScriptId(),
    timeZone: Session.getScriptTimeZone(),
    activeUserEmail: Session.getActiveUser().getEmail(),
    effectiveUserEmail: Session.getEffectiveUser().getEmail()
  };
}
