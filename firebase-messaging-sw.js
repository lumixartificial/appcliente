// Versión 9 - Forzar actualización de caché
// Importar los scripts de Firebase necesarios
// Importamos los scripts de Firebase necesarios
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Usa la misma configuración de Firebase de tu app
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[SW Definitivo] Mensaje recibido: ", payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';
    
    // La URL de la app que envió la notificación (cliente o cobrador)
    const appOrigin = new URL(payload.data.origin || self.location.origin).origin;

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-notification',
        data: {
            // Guardamos la URL completa y absoluta a la que debemos navegar.
            url: new URL('/#notifications', appOrigin).href
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [LÓGICA DE CLIC FINAL Y ROBUSTA]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW Definitivo] Notificación clickeada:', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;

    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((clientList) => {
        // 1. Revisa si una ventana de la app ya está abierta.
        for (const client of clientList) {
            // Si la URL de un cliente abierto coincide con el origen de la URL de destino...
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log("[SW Definitivo] App ya está abierta. Navegando y enfocando.");
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }

        // 2. Si no se encontró ninguna ventana, abre una nueva.
        if (clients.openWindow) {
            console.log("[SW Definitivo] App no encontrada. Abriendo nueva ventana.");
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
