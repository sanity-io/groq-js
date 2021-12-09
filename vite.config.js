const path = require('path')
const {defineConfig} = require('vite')
const dts = require('vite-dts').default

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['esm', 'umd'],
      name: 'groq-js',
      fileName: (format) => `groq-js.${format}.js`,
    },
    rollupOptions: {
      output: {
        // Since we publish our ./src folder, there's no point in bloating sourcemaps with another copy of it.
        sourcemapExcludeSources: true,
        globals: {
          'groq-js': 'groqJS',
        },
      },
    },
    sourcemap: true,
  },
  plugins: [dts()],
})
