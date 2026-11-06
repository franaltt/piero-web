import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Dos páginas: el inicio (/) y los recursos (/recursos/)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        recursos: resolve(__dirname, 'recursos/index.html'),
      },
    },
  },
});
