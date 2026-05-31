import axios from 'axios';

// On utilise import.meta.env pour lire le fichier .env de Vite
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export default api;