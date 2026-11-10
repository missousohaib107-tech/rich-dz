import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from GitHub Pages at /rich-dz/
// Two pages: the public site (index.html) and the orders dashboard (admin/index.html)
export default defineConfig({
  base: '/rich-dz/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
