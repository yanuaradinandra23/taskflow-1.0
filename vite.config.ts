
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    // Define process.env global variables to be replaced during build
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    server: {
      host: true, // Listen on all addresses (0.0.0.0)
      strictPort: true,
      port: 5173, 
      hmr: {
        clientPort: 5173, // Force client port to match server port for consistent HMR
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
