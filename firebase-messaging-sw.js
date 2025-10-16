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

console.log(`[SW-CLIENTE v5.0] Service Worker del Cliente cargado y listo.`);

/**
 * Esto se ejecuta cuando llega un mensaje y la app está cerrada o en segundo plano.
 */
messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-CLIENTE v5.0]`;
  console.log(`${LOG_PREFIX} >>> MENSAJE RECIBIDO <<<`, payload);

  // VALIDACIÓN CLAVE: El payload debe contener la sección 'data'
  if (!payload.data) {
    console.error(`${LOG_PREFIX} ERROR: El payload no contiene la sección 'data'.`, payload);
    return;
  }

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    // La 'data' aquí es para que el evento 'notificationclick' sepa a dónde ir.
    data: {
      url: payload.data.url 
    }
  };

  console.log(`${LOG_PREFIX} Mostrando notificación:`, notificationTitle, notificationOptions);
  
  // Muestra la notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Esto se ejecuta cuando el usuario hace clic en la notificación.
 */
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW-CLIENTE v5.0] Clic en notificación recibido.`);
    event.notification.close();

    // Abre la URL que se guardó en la 'data' de la notificación
    const promiseChain = clients.openWindow(event.notification.data.url);
    event.waitUntil(promiseChain);
});

// Ciclo de vida del Service Worker para asegurar que siempre esté actualizado.
self.addEventListener('install', (event) => {
  console.log(`[SW-CLIENTE v5.0] Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-CLIENTE v5.0] Activado.`);
  event.waitUntil(self.clients.claim());
});
