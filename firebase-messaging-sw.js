// Versión 9 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Copia tu configuración de Firebase aquí
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

const SW_VERSION = "v2.1-hybrid-fix";
console.log(`Service Worker ${SW_VERSION} cargado.`);

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});


// Este manejador SÓLO se ejecuta cuando el usuario hace clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Evento 'notificationclick' DETECTADO.`);
    event.notification.close();

    const targetUrl = event.notification.data.url;
    
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos de la notificación. Abriendo página principal.`);
        return event.waitUntil(clients.openWindow(self.location.origin));
    }

    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        for (const client of windowClients) {
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Ventana encontrada. Navegando y enfocando: ${targetUrl}`);
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] Abriendo nueva ventana en: ${targetUrl}`);
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
