import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|react-router|react-router-dom)[\\/]/,
              priority: 20
            },
            {
              name: 'firebase',
              test: /node_modules[\\/](?:firebase|@firebase)[\\/]/,
              priority: 15
            },
            {
              name: 'icons',
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 10
            },
            {
              name: 'math',
              test: /node_modules[\\/]katex[\\/]/,
              priority: 10
            }
          ]
        }
      }
    }
  }
})
