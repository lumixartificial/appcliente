const SW_VERSION = "v9.0-revisado"; // Versión actualizada

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
            data: {
                url: self.location.origin + '/#notifications' 
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

self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    console.log(`[SW-CLIENTE] Clic en notificación. URL de destino: ${targetUrl}`);
    event.notification.close();

    // Lógica idéntica a la del cobrador para un comportamiento consistente y robusto.
    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((clientList) => {
        if (clientList.length > 0) {
            const client = clientList[0];
            console.log('[SW-CLIENTE] Ventana existente encontrada. Navegando y enfocando.');
            return client.navigate(targetUrl).then(c => c.focus());
        }

        console.log('[SW-CLIENTE] Ninguna ventana abierta. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});
