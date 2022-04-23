import { defineConfig } from 'vite';

module.exports = defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'emoji-picker',
    }
  }
})