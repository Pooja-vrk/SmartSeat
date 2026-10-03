// Service Worker registration helper for SmartSeat PWA
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SmartSeat PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[SmartSeat PWA] Service Worker registration failed:', error);
        });
    });
  }
}
