const SW_VERSION = "v9.3-definitivo"; // Versión actualizada

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log(`[SW-CLIENTE] Service Worker ${SW_VERSION} cargado.`);

messaging.onBackgroundMessage((payload) => {
    const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} Mensaje en segundo plano recibido.`, payload);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cliente-notification',
        data: { url: payload.data.url }
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [SOLUCIÓN DEFINITIVA] Combinamos skipWaiting con una activación controlada.
self.addEventListener('install', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Instalando y forzando activación inmediata.`);
  event.waitUntil(self.skipWaiting()); // Fuerza al nuevo SW a activarse tan pronto como se instale.
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Activado y tomando control.`);
  // Tomará el control de todas las páginas abiertas.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    event.notification.close();

    // Lógica simplificada y más directa para abrir o enfocar la ventana.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
            // 1. Si encuentra una ventana que coincida con la URL, la enfoca.
            for (const client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. Si no encuentra ninguna coincidencia, abre una ventana nueva.
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
