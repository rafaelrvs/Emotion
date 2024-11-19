import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Adiciona alias '@' para a pasta src
    },
  },
  build: {
    assetsInclude: [/\.(png|gif)$/], // Inclui arquivos .png e .gif no build
  },
});
