import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const manualChunks = (id: string) => {
  if (!id.includes('node_modules')) {
    if (id.endsWith('/constants.ts')) return 'catalog-data';
    return undefined;
  }

  if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
    return 'react-vendor';
  }
  if (id.includes('/lucide-react/')) return 'icons-vendor';
  if (id.includes('/@firebase/auth') || id.includes('/firebase/auth')) return 'firebase-auth';
  if (id.includes('/@firebase/firestore') || id.includes('/firebase/firestore')) return 'firebase-firestore';
  if (id.includes('/@firebase/functions') || id.includes('/firebase/functions')) return 'firebase-functions';
  if (id.includes('/@firebase/storage') || id.includes('/firebase/storage')) return 'firebase-storage';
  if (id.includes('/@firebase/') || id.includes('/firebase/')) return 'firebase-core';
  return 'vendor';
};

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
