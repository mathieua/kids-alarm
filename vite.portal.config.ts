import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/portal/',
  build: {
    outDir: 'dist/portal',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'portal.html'),
    },
  },
  resolve: {
    alias: {
      '@portal': path.resolve(__dirname, './src/portal'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000',
      '/media': 'http://localhost:3000',
    },
  },
})
