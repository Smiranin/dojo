import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev only: the phone on the LAN talks to the server directly (DOJO_HOST), not to Vite.
    proxy: { '/api': 'http://127.0.0.1:4800' },
  },
  test: {
    name: 'web',
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: false,
  },
});
