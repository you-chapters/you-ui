import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/entries': {
        target: 'https://you.havryliuk.com',
        changeOrigin: true,
      }
    }
  }
})