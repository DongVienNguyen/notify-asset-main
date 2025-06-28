import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SecureAuthProvider } from './hooks/useSecureAuth.tsx'; // Import SecureAuthProvider
import React from 'react'; // Import React for StrictMode
import { registerServiceWorker } from './utils/pushNotificationUtils';

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SecureAuthProvider> {/* Wrap App with SecureAuthProvider */}
      <App />
    </SecureAuthProvider>
  </React.StrictMode>
);