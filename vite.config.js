import { defineConfig } from 'vite'
import { globSync } from 'node:fs'
import { resolve } from 'node:path'

// Toda página .html da raiz e de perfil-rosto/ vira uma entrada do build.
const paginas = globSync(['*.html', 'perfil-rosto/*.html'])

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(paginas.map((p) => [p.replace(/\.html$/, ''), resolve(p)])),
    },
  },
})
