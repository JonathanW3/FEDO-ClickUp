import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde cualquier IP en la red
    port: 5173,
    proxy: {
      '/api/personal': {
        target: 'https://n8n-dev.waopos.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/personal/, '/webhook/TablaMiembros'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Agregar el JSON requerido al proxy request
            if (req.method === 'POST') {
              const bodyData = JSON.stringify({
                "Type": "SQL",
                "Table": "Miembros"
              });
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
