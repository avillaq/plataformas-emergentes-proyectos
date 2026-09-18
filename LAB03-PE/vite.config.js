import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ninos1: resolve(import.meta.dirname, 'test-ninos-1.html'),
        ninos2: resolve(import.meta.dirname, 'test-ninos-2.html'),
        ninos3: resolve(import.meta.dirname, 'test-ninos-3.html'),
        adultos1: resolve(import.meta.dirname, 'test-Adultos-1.html'),
        adultos2: resolve(import.meta.dirname, 'test-Adultos-2.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
