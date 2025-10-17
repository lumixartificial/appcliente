importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// La configuración de Firebase no cambia
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
const LOG_PREFIX = `[SW-CLIENTE-DIAGNOSTICO]`;

console.log(`${LOG_PREFIX} Service Worker v7.0 cargado y Firebase inicializado.`);

messaging.onBackgroundMessage((payload) => {
  console.log(`${LOG_PREFIX} >>> MENSAJE RECIBIDO EN SEGUNDO PLANO <<<`, payload);

  if (!payload.data) {
    console.error(`${LOG_PREFIX} ERROR: El payload recibido NO contiene la sección 'data'. No se puede mostrar la notificación. Payload:`, payload);
    return;
  }
  console.log(`${LOG_PREFIX} La sección 'data' fue encontrada en el payload.`);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    tag: payload.data.tag,
    data: {
      url: payload.data.link
    }
  };

  console.log(`${LOG_PREFIX} Preparando para mostrar notificación con Título: [${notificationTitle}] y Opciones:`, notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log(`${LOG_PREFIX} El usuario hizo CLIC en la notificación.`);
    event.notification.close();
    console.log(`${LOG_PREFIX} Notificación cerrada. Intentando abrir URL: [${event.notification.data.url}]`);

    const promiseChain = clients.openWindow(event.notification.data.url);
    event.waitUntil(promiseChain);
});

self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} Evento 'install' disparado. Forzando activación con skipWaiting().`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} Evento 'activate' disparado. Tomando control de los clientes.`);
  event.waitUntil(self.clients.claim());
});

