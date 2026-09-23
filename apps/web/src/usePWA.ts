import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Music Folder installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Registro de Service Worker desactivado para evitar interferencias y peticiones duplicadas
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    */

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger app installation dialog
  const promptInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User accepted installation prompt');
        setCanInstall(false);
      } else {
        console.log('[PWA] User dismissed installation prompt');
      }
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Trigger app update by posting SKIP_WAITING to waiting Service Worker
  const updateApp = () => {
    setIsUpdating(true);
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Fallback message dispatch
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // If running dev server without SW, force window reload
      window.location.reload();
    }
  };

  // Manual update trigger for preview / testing
  const checkForUpdates = () => {
    if (swRegistration) {
      swRegistration.update().then(() => {
        console.log('[PWA] Manual update check completed.');
      });
    }
  };

  return {
    canInstall,
    isInstalled,
    promptInstall,
    hasUpdate,
    isUpdating,
    updateApp,
    checkForUpdates,
    setHasUpdate,
  };
}
