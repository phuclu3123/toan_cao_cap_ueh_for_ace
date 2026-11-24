import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'ueh-isolated-dev-cache',
    config(config, { command, isPreview }) {
      if (command !== 'serve' || isPreview) return;
      // Concurrent local/test servers must not overwrite each other's optimizer cache.
      return { cacheDir: `node_modules/.vite/dev-${config.server?.port || 5173}` };
    }
  }],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    // OneDrive/editor writes can briefly expose a truncated file. Transform only
    // once the source has settled, so the dev cache cannot keep an empty module.
    watch: { awaitWriteFinish: { stabilityThreshold: 180, pollInterval: 40 } },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
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
