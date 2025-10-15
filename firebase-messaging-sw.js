// Versión 9 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const SW_VERSION = "v3.0-client-push";
console.log(`Service Worker (Cliente) ${SW_VERSION} cargado.`);

// Maneja los mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log(`[SW Cliente ${SW_VERSION}] Mensaje en segundo plano recibido:`, payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
    tag: `lumix-cliente-notification-${payload.data.type || 'general'}`,
    data: {
      url: payload.fcmOptions.link || self.location.origin
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log(`[SW Cliente ${SW_VERSION}] Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW Cliente ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});

// Maneja el clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW Cliente ${SW_VERSION}] Clic en notificación detectado.`);
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
