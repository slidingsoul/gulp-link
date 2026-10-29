import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8081'
  const apiOrigin = (() => {
    try {
      return new URL(apiTarget).origin
    } catch {
      return apiTarget
    }
  })()
  const authTarget = (env.VITE_NEON_AUTH_URL || '').replace(/\/+$/, '')
  const authOrigin = env.VITE_AUTH_ORIGIN || 'http://localhost:8081'
  const authMode = env.VITE_AUTH_MODE || 'proxy'

  // The browser stays on the frontend origin and Vite proxies the API. snap-link
  // supports CORS for direct production calls, but rewriting Origin to the API
  // origin keeps local requests working even when CORS_ALLOWED_ORIGINS is unset.
  // The auth service is proxied too: same-origin cookies, no third-party
  // cookie quirks, and the Origin header is rewritten to an origin Neon
  // already trusts (snap-link's own local origin).
  const proxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
      headers: { Origin: apiOrigin },
    },
    ...(authMode === 'proxy' && authTarget
      ? {
          '/auth': {
            target: authTarget,
            changeOrigin: true,
            secure: true,
            rewrite: (path: string) => path.replace(/^\/auth/, ''),
            headers: { Origin: authOrigin },
          },
        }
      : {}),
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
  }
})
