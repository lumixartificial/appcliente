const SW_VERSION = "v9.1-robusto"; // Versión actualizada

// Importa los scripts de Firebase.
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log(`[SW-CLIENTE] Service Worker ${SW_VERSION} cargado y listo.`);

messaging.onBackgroundMessage((payload) => {
    const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} >>> MENSAJE EN SEGUNDO PLANO RECIBIDO <<<`, payload);

    try {
        if (!payload.data) {
            console.error(`${LOG_PREFIX} ERROR: El payload no contiene la sección 'data'.`);
            return;
        }
        console.log(`${LOG_PREFIX} Payload 'data' validado.`, payload.data);

        const notificationTitle = payload.data.title;
        const notificationOptions = {
            body: payload.data.body,
            icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
            tag: 'lumix-cliente-notification',
            // [CORRECCIÓN] Usar la URL directamente desde el payload enviado por la Cloud Function.
            data: {
                url: payload.data.url
            }
        };
        console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

        console.log(`${LOG_PREFIX} Intentando mostrar la notificación...`);
        return self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => {
                console.log(`${LOG_PREFIX} ¡ÉXITO! Notificación mostrada.`);
            })
            .catch(err => {
                console.error(`${LOG_PREFIX} ERROR al mostrar notificación:`, err);
            });

    } catch (error) {
        console.error(`${LOG_PREFIX} ERROR CATASTRÓFICO en onBackgroundMessage:`, error);
    }
});

self.addEventListener('install', (event) => {
    console.log(`[SW-CLIENTE ${SW_VERSION}] Instalando y forzando activación.`);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log(`[SW-CLIENTE ${SW_VERSION}] Activado y tomando control.`);
    event.waitUntil(self.clients.claim());
});

// [SOLUCIÓN DEFINITIVA] Lógica de clic de notificación mejorada y robusta.
self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    console.log(`[SW-CLIENTE] Clic en notificación. URL de destino: ${targetUrl}`);
    event.notification.close();

    // Esta lógica busca una ventana existente, la navega a la URL correcta y la enfoca.
    // Si no encuentra ninguna, abre una nueva. Es el método más fiable.
    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((clientList) => {
        // Busca una ventana que ya esté visible para priorizarla.
        for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
                return client.focus();
            }
        }
        // Si no hay una ventana visible en la URL correcta, o ninguna es visible,
        // toma la primera disponible y la navega/enfoca.
        if (clientList.length > 0) {
            console.log('[SW-CLIENTE] Ventana en segundo plano encontrada. Navegando y enfocando.');
            return clientList[0].navigate(targetUrl).then(client => client.focus());
        }

        // Si no hay ninguna ventana abierta de la app, abre una nueva.
        console.log('[SW-CLIENTE] Ninguna ventana abierta. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});
