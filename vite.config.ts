import { defineConfig } from 'vite';

export default defineConfig({
  // Crucial for GitHub Pages: allows loading assets relative to the current repository subpath
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

