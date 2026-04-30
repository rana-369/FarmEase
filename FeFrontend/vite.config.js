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
  build: {
    // Production optimizations
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Better chunking strategy
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'icons-vendor': ['react-icons'],
          'chart-vendor': ['recharts'],
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
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
