import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['react-hot-toast', 'lucide-react'],
          'auth-vendor': ['@react-oauth/google', 'js-cookie'],
          'utils-vendor': ['axios', 'xlsx', 'file-saver'],
        }
      }
    }
  }
})
