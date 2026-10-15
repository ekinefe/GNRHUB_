import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { brand } from './src/config/brand.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Fills %BRAND_NAME% in index.html from src/config/brand.js (single source of truth)
    { name: 'brand-html', transformIndexHtml: (html) => html.replaceAll('%BRAND_NAME%', brand.name) },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js', // We will create this next
    css: true,
  },
})
