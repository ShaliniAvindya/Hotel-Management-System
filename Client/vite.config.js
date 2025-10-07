import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** @type {import('tailwindcss').Config} */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open:true,
    proxy: {      '/api': {
        target: 'hotel-management-system-q26a.vercel.app',
        changeOrigin: true,
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
});
