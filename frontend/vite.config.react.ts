import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    preserveSymlinks: true,
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5175, // Different port from Vue app
    fs: {
      // Allow serving files from the linked SDS package
      allow: ['..', '../../Sendle/SDS/sendle-design-system-main/packages/sds-ui'],
    },
  },
  build: {
    outDir: 'dist-react',
  },
});
