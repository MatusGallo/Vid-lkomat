# Vydělkomat

## Ukládání dat (cloud sync mezi zařízeními)

Data se ukládají do **Supabase** (Postgres) přes serverless funkci na Vercelu
([api/entries.ts](api/entries.ts)). `localStorage` slouží už jen jako offline cache —
data se tak neztratí při vyčištění prohlížeče a synchronizují se mezi zařízeními.

### Jednorázové nastavení

1. **Supabase** – vytvoř projekt na [supabase.com](https://supabase.com) (free tier).
   - V *SQL Editoru* spusť obsah [supabase/schema.sql](supabase/schema.sql).
   - V *Project Settings → API* si zkopíruj **Project URL** a **`service_role`** klíč.
2. **Vercel** – v *Project Settings → Environment Variables* přidej:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role klíč *(tajný, nikdy ne do frontendu)*
   - `APP_PASSWORD_HASH` = SHA-256 hash přístupového hesla
     *(stávající hash je `7e11bc65a7852d1c5833549ad3a1bbc743deac167c2f18ae11b7b2784dd8d00d`)*
3. Redeploy. Hotovo.

### Lokální vývoj

Čisté `npm run dev` (Vite) neumí spustit `/api` funkce. Pro test cloud syncu lokálně:
`npm i -g vercel` a pak `vercel dev` (env proměnné nastav přes `vercel env pull`).
Bez toho appka funguje dál nad lokální cache.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
