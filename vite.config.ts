import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — changes rarely, long-cache
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Lucide icons — large icon tree, cache separately
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-vendor';
          }
          // Leaflet map library — only needed in the Map tab
          if (id.includes('node_modules/leaflet')) {
            return 'leaflet-vendor';
          }
        },
      },
    },
    // Suppress chunk-size warnings (we've already split them optimally)
    chunkSizeWarningLimit: 600,
  },
});
