const SW_VERSION = "v8.0-cliente-homologado";

// Importa los scripts de Firebase en formato compatibilidad, igual que en el SW del cobrador.
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

// Obtén la instancia de Messaging.
const messaging = firebase.messaging();

console.log(`[SW-CLIENTE] Service Worker ${SW_VERSION} cargado y listo.`);

/**
 * Se ejecuta cuando llega un mensaje y la app está en segundo plano o cerrada.
 */
messaging.onBackgroundMessage((payload) => {
    const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} >>> ¡MENSAJE EN SEGUNDO PLANO RECIBIDO! <<<`, payload);

    try {
        if (!payload.data) {
            console.error(`${LOG_PREFIX} ERROR FATAL: El payload no contiene la sección 'data'.`);
            return;
        }
        console.log(`${LOG_PREFIX} Payload 'data' validado.`, payload.data);

        const notificationTitle = payload.data.title;
        const notificationOptions = {
            body: payload.data.body,
            icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
            tag: 'lumix-cliente-notification', // Tag específico para el cliente
            data: {
                // La URL a la que se navegará al hacer clic. Apunta a la sección de notificaciones.
                url: self.location.origin + '/#notifications' 
            }
        };
        console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

        console.log(`${LOG_PREFIX} Intentando mostrar la notificación AHORA...`);
        return self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => {
                console.log(`${LOG_PREFIX} ¡ÉXITO! showNotification() se completó.`);
            })
            .catch(err => {
                console.error(`${LOG_PREFIX} ERROR DENTRO de showNotification():`, err);
            });

    } catch (error) {
        console.error(`${LOG_PREFIX} ERROR CATASTRÓFICO DENTRO DE onBackgroundMessage:`, error);
    }
});

self.addEventListener('install', (event) => {
    console.log(`[SW-CLIENTE ${SW_VERSION}] Instalando... Forzando activación.`);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log(`[SW-CLIENTE ${SW_VERSION}] Activado y tomando control de los clientes.`);
    event.waitUntil(self.clients.claim());
});

/**
 * Se ejecuta cuando el usuario hace clic en la notificación.
 */
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW-CLIENTE ${SW_VERSION}] El usuario hizo clic en la notificación.`);
    event.notification.close();

    const targetUrl = event.notification.data.url || self.location.origin;

    // Busca si la app ya está abierta para enfocarla; si no, abre una nueva ventana.
    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        // Revisa si hay una ventana de la app abierta
        for (const client of windowClients) {
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                // Si la encuentra, la enfoca y navega a la URL correcta.
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        // Si no hay ninguna ventana abierta, abre una nueva.
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    });
    event.waitUntil(promiseChain);
});
