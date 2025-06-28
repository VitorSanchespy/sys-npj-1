import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  // 👇 ESSENCIAL para evitar erro 404 em rotas com React Router
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Serve index.html como fallback para rotas desconhecidas
  base: '/',
});
