// vite.config.js
export default {
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', '@theatre/core', '@theatre/studio', 'gsap']
  }
}
