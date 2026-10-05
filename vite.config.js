import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from GitHub Pages at /rich-dz/
export default defineConfig({
  base: '/rich-dz/',
  plugins: [react()],
})
