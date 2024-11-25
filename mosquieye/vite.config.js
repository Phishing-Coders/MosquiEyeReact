import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    //host: '172.16.0.2', // or '127.0.0.1' or a custom hostname
    port: 3000, // Replace with your desired port
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Server on 5000
        changeOrigin: true
      }
    },
    fs: {
      allow: ['.'], // Ensure Vite can access files properly
    }
  },
});
