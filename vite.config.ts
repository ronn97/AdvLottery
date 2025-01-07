import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 添加更多别名...
    },
  },
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', //设置0.0.0.0和true 就是监听所有
    port: 5173,
    open: true
  }
})
