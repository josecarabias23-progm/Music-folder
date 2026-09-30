import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de validez de caché por defecto
      gcTime: 1000 * 60 * 15,    // 15 minutos en memoria sin uso
      refetchOnWindowFocus: false, // Evitar peticiones al cambiar foco de ventana
      retry: 1,                    // Máximo 1 reintento
    },
  },
});

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
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
