import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    assetsInclude: [/\.(png|gif)$/], // Inclui arquivos de imagens no build
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(png|gif)$/.test(assetInfo.name)) {
            return 'emogi/[name]-[hash][extname]'; // Garante que imagens vão para a pasta correta
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
