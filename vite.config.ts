import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Only split known heavy groups; let Vite handle all other deps.
          if (id.includes('/node_modules/@mui/')) {
            return 'vendor-mui';
          }
          if (id.includes('/node_modules/firebase/')) {
            return 'vendor-firebase';
          }
          if (id.includes('/node_modules/jspdf/') || id.includes('/node_modules/xlsx/')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
})
