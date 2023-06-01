module.exports = {
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.tsx',
      name: 'boost-button',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
};