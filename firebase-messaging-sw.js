// Versión 3 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// La configuración de tu proyecto de Firebase (debe ser la misma que en tu app)
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Inicializar la app de Firebase
firebase.initializeApp(firebaseConfig);

// Obtener la instancia del servicio de mensajería
const messaging = firebase.messaging();

// (Opcional) Manejar las notificaciones en segundo plano
// Esto te permite personalizar la notificación antes de mostrarla
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
 
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});