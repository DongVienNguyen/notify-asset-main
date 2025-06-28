import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SecureAuthProvider } from './hooks/useSecureAuth.tsx';
import React from 'react';
import { Toaster } from '@/components/ui/toast'; // Cập nhật import Toaster

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SecureAuthProvider>
      <App />
      <Toaster />
    </SecureAuthProvider>
  </React.StrictMode>
);