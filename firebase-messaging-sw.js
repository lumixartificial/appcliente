// Versión 9 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
// Importamos los scripts de Firebase necesarios

const SW_VERSION = "v4.0-client-diagnostico";
const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO ${SW_VERSION}]`;

try {
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

    console.log(`${LOG_PREFIX} Service Worker cargado y Firebase inicializado.`);

    messaging.onBackgroundMessage((payload) => {
        console.log(`${LOG_PREFIX} >>> ¡MENSAJE PUSH EN SEGUNDO PLANO RECIBIDO! <<<`, payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
            tag: payload.notification.tag || 'lumix-cliente-notification',
            data: {
                url: payload.fcmOptions ? payload.fcmOptions.link : self.location.origin
            }
        };
        console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

        return self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => console.log(`${LOG_PREFIX} ¡ÉXITO! Notificación mostrada.`))
            .catch(err => console.error(`${LOG_PREFIX} ERROR al mostrar la notificación:`, err));
    });

} catch (error) {
    console.error(`${LOG_PREFIX} ERROR FATAL en el script principal del Service Worker:`, error);
}

self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} Evento: 'install'. Saltando la espera.`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} Evento: 'activate'. Tomando control de las páginas.`);
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    console.log(`${LOG_PREFIX} Evento: 'notificationclick'. El usuario hizo clic en la notificación.`);
    event.notification.close();
    const targetUrl = event.notification.data.url || self.location.origin;

    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        for (const client of windowClients) {
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`${LOG_PREFIX} Encontrada una ventana abierta de la app. Navegando y enfocando.`);
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        if (clients.openWindow) {
            console.log(`${LOG_PREFIX} No se encontraron ventanas abiertas. Abriendo una nueva en: ${targetUrl}`);
            return clients.openWindow(targetUrl);
        }
    });
    event.waitUntil(promiseChain);
});
