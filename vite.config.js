import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VUE_APP_')
  return {
    base: env.VUE_APP_PUBLIC_PATH || '/',
    envPrefix: 'VUE_APP_',
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(root, 'src/assets/icons/svg')],
        symbolId: 'icon-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(root, 'src'),
        path: 'path-browserify'
      },
      extensions: ['.mjs', '.js', '.vue', '.json']
    },
    server: {
      host: '0.0.0.0',
      port: 81,
      proxy: {
        [env.VUE_APP_BASE_API || '/dev-api']: {
          target: env.VUE_APP_SERVER_URL || 'http://127.0.0.1:8081',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(new RegExp('^' + (env.VUE_APP_BASE_API || '/dev-api')), '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'legacy-js-api']
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false
    }
  }
})
