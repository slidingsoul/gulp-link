/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEON_AUTH_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_API_BASE?: string
  readonly VITE_SHORT_BASE_URL?: string
  readonly VITE_AUTH_ORIGIN?: string
  readonly VITE_AUTH_MODE?: 'proxy' | 'direct'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
