import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  server: {
    //host: '172.16.0.2', // or '127.0.0.1' or a custom hostname
    port: 3000, // Replace with your desired port
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://mosquieye-server.vercel.app/'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    fs: {
      allow: ['.'], // Ensure Vite can access files properly
    }
  }
});
