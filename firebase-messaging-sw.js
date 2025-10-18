const SW_VERSION = "v9.5-robusto-definitivo"; // Versión actualizada

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

// [SOLUCIÓN DEFINITIVA] onBackgroundMessage ahora siempre recibe el payload 'data'
// y es responsable de mostrar la notificación.
messaging.onBackgroundMessage((payload) => {
    const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} Mensaje en segundo plano recibido.`, payload);

    // Se asegura de leer siempre desde payload.data, que es donde la Cloud Function envía la información.
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cliente-notification',
        data: { url: payload.data.url } // Guardamos la URL de destino en la propiedad 'data'
    };
    
    // El Service Worker ahora crea y muestra la notificación.
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Instalando y forzando activación inmediata.`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-CLIENTE ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});

// [SOLUCIÓN DEFINITIVA] Esta lógica de 'notificationclick' es ahora 100% fiable
// porque siempre se aplica a notificaciones creadas por nuestro propio código.
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

        // Si no hay una ventana con la URL exacta, pero hay alguna ventana de la app abierta...
        if (windowClients.length > 0) {
            console.log('[SW-CLIENTE] Otra ventana de la app está abierta. Navegando y enfocando...');
            // La navega a la URL correcta y luego la enfoca, trayéndola al frente.
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // Si no hay ninguna ventana abierta, abre una nueva.
        console.log('[SW-CLIENTE] Ninguna ventana abierta. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});
