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
        target: 'https://mosquieye-server-bfn34.ondigitalocean.app',
        changeOrigin: true,
        secure: true,
      }
    },
    fs: {
      allow: ['.'], // Ensure Vite can access files properly
    }
  }
});
