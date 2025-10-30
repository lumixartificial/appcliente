const SW_VERSION = "v9.4-robusto"; // Versión actualizada

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

// [MODIFICACIÓN] Se eliminan los listeners 'install' y 'activate'
// que contenían self.skipWaiting() y self.clients.claim().
// Esto previene posibles bucles de recarga y permite actualizaciones más seguras.
/*
self.addEventListener('install', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Instalando y forzando activación inmediata.`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});
*/

// [SIN CAMBIOS] La lógica robusta de notificationclick se mantiene
self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    event.notification.close();

    // Esta es la lógica más fiable para abrir/enfocar la app.
    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((windowClients) => {
        // Busca si ya hay una ventana abierta con la misma URL.
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);

        if (existingClient) {
            console.log('[SW-CLIENTE] Ventana existente encontrada. Enfocando...');
            return existingClient.focus();
        }

        // Si no hay una ventana con la URL exacta, pero hay alguna ventana de la app abierta (incluso en segundo plano)...
        if (windowClients.length > 0) {
            console.log('[SW-CLIENTE] Otra ventana de la app está abierta. Navegando y enfocando...');
            // La navega a la URL correcta, lo que la trae al frente, y luego la enfoca.
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // Si no hay ninguna ventana abierta, abre una nueva.
        console.log('[SW-CLIENTE] Ninguna ventana abierta. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});
