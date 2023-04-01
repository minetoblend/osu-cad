import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {resolve} from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({
    isProduction: true,
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@osucad/unison': resolve(__dirname, '../unison/src'),
      '@osucad/unison-client': resolve(__dirname, '../unison-client/src'),
    }
  },
  server: {
    host: '0.0.0.0'
  },
});
