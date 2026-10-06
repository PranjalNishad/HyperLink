/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Base URL of the HyperLink backend, e.g. http://localhost:3000 */
  readonly PUBLIC_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
