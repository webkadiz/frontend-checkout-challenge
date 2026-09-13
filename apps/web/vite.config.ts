import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          http: ['axios'],
          react: ['react', 'react-dom'],
          router: ['react-router'],
          forms: ['react-hook-form', 'react-phone-number-input/input'],
        },
      },
    },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:4000', '/assets': 'http://127.0.0.1:4000' } },
});
