import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Only use base path for production (GitHub Pages)
  base: command === 'build' ? '/newsletter-builder/' : '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
}));
