import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Self-Unregister script: Desinstala Service Workers activos y desaloja cachés viciadas
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
