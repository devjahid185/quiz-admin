import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        host: true,
        port: 5173,
        // allow requests coming from the ngrok host
        allowedHosts: ['rema-cleansable-mirtha.ngrok-free.dev'],
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
        hmr: {
            // if ngrok provides https endpoint, use that as HMR host
            host: 'rema-cleansable-mirtha.ngrok-free.dev',
            protocol: 'wss',
        },
    },
});
