import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - update this to match your repository name
  // If your repo is "forecasting", keep it as "/forecasting/"
  // If deploying to username.github.io, change to "/"
  base: process.env.NODE_ENV === 'production' ? '/forecasting/' : '/',
})
