import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            shared: path.resolve(__dirname, '../shared'),
        },
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['speaker.local', 'localhost'],
    },
});
