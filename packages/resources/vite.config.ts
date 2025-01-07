import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';


export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'osucad-resources',
    }
  }
})
