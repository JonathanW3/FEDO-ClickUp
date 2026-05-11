import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde cualquier IP en la red
    port: 5173,
    proxy: {
      '/webhook': {
        target: 'https://n8n-dev.waopos.com',
        changeOrigin: true,
        secure: true,
      },
    }
  }
})
