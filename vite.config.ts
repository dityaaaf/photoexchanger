import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy /api/claid/* → https://api.claid.ai/v1/*
      // This avoids CORS errors during local development
      '/api/claid': {
        target: 'https://api.claid.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claid/, '/v1'),
      },
    },
  },
});

