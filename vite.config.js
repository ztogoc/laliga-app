import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Asegurarse de que las rutas de los recursos sean relativas
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
      },
    },
    // Asegurarse de que los archivos JSON se copien
    assetsInclude: ['**/*.json'],
    // Copiar archivos públicos
    copyPublicDir: true,
  },
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});