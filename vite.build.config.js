import { defineConfig } from 'vite';

module.exports = defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    minify: true,
  },
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'emoji-picker',
    },
    minify: 'terser'
  }
})