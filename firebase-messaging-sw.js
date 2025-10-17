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

// Se inicializa Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log(`[SW-CLIENTE v6.0] Service Worker del Cliente cargado y listo.`);

/**
 * Este listener AHORA SÍ se ejecutará porque la Cloud Function enviará un mensaje de 'data'.
 */
messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-CLIENTE v6.0]`;
  console.log(`${LOG_PREFIX} >>> MENSAJE DE DATOS RECIBIDO <<<`, payload);

  // Verificación clave: El payload debe contener la sección 'data'
  if (!payload.data) {
    console.error(`${LOG_PREFIX} ERROR: El payload no contiene la sección 'data'.`, payload);
    return;
  }

  // --- CORRECCIÓN CLAVE ---
  // Ahora leemos los datos directamente del objeto 'data' que envía la Cloud Function.
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    tag: payload.data.tag, // Usamos el 'tag' para agrupar notificaciones
    // La 'data' aquí es para que el evento 'notificationclick' sepa a dónde ir.
    data: {
      url: payload.data.link // El link viene dentro de 'data'
    }
  };

  console.log(`${LOG_PREFIX} Mostrando notificación:`, notificationTitle, notificationOptions);
  
  // Muestra la notificación al usuario
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Esto se ejecuta cuando el usuario hace clic en la notificación. No necesita cambios.
 */
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW-CLIENTE v6.0] Clic en notificación recibido.`);
    event.notification.close(); // Cierra la notificación

    // Abre la URL que se guardó en la 'data' de la notificación
    // Esto enfocará la PWA si ya está abierta o la abrirá en una nueva pestaña.
    const promiseChain = clients.openWindow(event.notification.data.url);
    event.waitUntil(promiseChain);
});

// El ciclo de vida del Service Worker es correcto, asegura que siempre esté actualizado.
self.addEventListener('install', (event) => {
  console.log(`[SW-CLIENTE v6.0] Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-CLIENTE v6.0] Activado.`);
  event.waitUntil(self.clients.claim());
});
