// Versión 9 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase para la App del Cliente.
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

const LOG_PREFIX = `[SW-CLIENTE v9.0]`;
console.log(`${LOG_PREFIX} Service Worker del Cliente cargado.`);

/**
 * [LÓGICA PARA MOSTRAR NOTIFICACIONES - Clonada del Cobrador]
 * Se ejecuta cuando llega un mensaje y la app está en segundo plano.
 * Lee desde 'payload.data'.
 */
messaging.onBackgroundMessage((payload) => {
  console.log(`${LOG_PREFIX} >>> MENSAJE RECIBIDO <<<`, payload);

  if (!payload.data) {
    console.error(`${LOG_PREFIX} ERROR: El payload no contiene la sección 'data'.`, payload);
    return;
  }

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    tag: 'lumix-cliente-notification',
    data: { 
      url: payload.data.url 
    }
  };

  console.log(`${LOG_PREFIX} Mostrando notificación:`, notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * [LÓGICA PARA EL CLIC - Clonada del Cobrador]
 * Se ejecuta cuando el usuario toca la notificación.
 */
self.addEventListener('notificationclick', (event) => {
    console.log(`${LOG_PREFIX} Clic en notificación recibido.`);
    event.notification.close();
    const targetUrl = event.notification.data.url || self.location.origin;

    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        for (const client of windowClients) {
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    });
    event.waitUntil(promiseChain);
});


// Ciclo de vida del Service Worker.
self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} Activado.`);
  event.waitUntil(self.clients.claim());
});
