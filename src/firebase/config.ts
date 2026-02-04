// Firebase configuration
// Prioritize injected GAS data, fall back to environment variables for local dev

const getGASConfig = () => {
  if (typeof window !== 'undefined' && window.SERVER_DATA) {
    try {
      const decoded = JSON.parse(atob(window.SERVER_DATA));
      return decoded.firebaseConfig;
    } catch (e) {
      console.error('Failed to parse GAS data', e);
    }
  }
  return null;
};

const gasConfig = getGASConfig();

export const firebaseConfig = gasConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "PLACEHOLDER",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "PLACEHOLDER",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "PLACEHOLDER",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "PLACEHOLDER",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "PLACEHOLDER"
};

// Start logic for hydration
export const initialAppState = (() => {
  if (typeof window !== 'undefined' && window.SERVER_DATA) {
    try {
      return JSON.parse(atob(window.SERVER_DATA));
    } catch (e) { return null; }
  }
  return null;
})();
