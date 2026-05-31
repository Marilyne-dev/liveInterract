import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// ✅ Utilise les variables Vite pour Pusher
console.log("🔍 Variables Vite Pusher chargées :", {
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true, // ✅ Sécurisé par défaut avec Pusher
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/broadcasting/auth`, // ✅ On garde ta configuration d'authentification
    auth: {
        withCredentials: true,
    },
});

console.log("✅ Echo initialisé avec Pusher !", window.Echo);