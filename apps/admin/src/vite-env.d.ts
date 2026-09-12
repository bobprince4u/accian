/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define your custom environment variables here
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
