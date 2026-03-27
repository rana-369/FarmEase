import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      // Proxy uploads folder to backend to avoid CORS/CORB issues
      '/uploads': {
        target: 'https://localhost:7284',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
