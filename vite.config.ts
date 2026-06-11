import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // host: true vystaví dev server do LAN, aby šel otevřít z mobilu/tabletu na stejné Wi-Fi.
  server: { host: true },
})
