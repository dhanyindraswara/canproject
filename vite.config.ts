import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Absolute base matching the GitHub Pages project subpath. Using the
  // explicit path (instead of './') keeps asset URLs correct even when the
  // page is opened without a trailing slash (/projectmanagement).
  base: '/projectmanagement/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
