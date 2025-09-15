# Landing Monorepo — Next.js + Turborepo + pnpm

Monorepo listo para crear **muchas landings independientes** (cada una con su CSS y su Tailwind)
y **compartir packages** comunes (UI, config y preset de Tailwind).

> **Script para crear landings:** `scripts/new-landing.mjs`  
> Atajo desde `package.json`: `pnpm new <nombre>`

---

## 🔧 Requisitos
- **Node** ≥ 18.18 (recomendado 20.x)
- **pnpm** ≥ 9

Comprueba:
```bash
node -v
pnpm -v
```

---

## 🚀 Inicio rápido
```bash
pnpm install
pnpm dev --filter landing-one

# Crear una nueva landing
pnpm new mi-landing
pnpm dev --filter mi-landing
```

- Si el puerto 3000 está ocupado:
```bash
PORT=3010 pnpm --filter mi-landing dev
# PowerShell (Windows):
# $env:PORT=3010; pnpm --filter mi-landing dev
```

---

## 🗂️ Estructura del repo
```
.
├─ apps/
│  ├─ _template/        # plantilla base para clonar
│  └─ landing-one/      # ejemplo funcionando
├─ packages/
│  ├─ config/           # tipos/utilidades compartidas
│  ├─ tailwind-preset/  # preset de Tailwind con tokens/colores
│  └─ ui/               # librería de componentes compartidos
├─ scripts/
│  └─ new-landing.mjs   # generador de landings
├─ turbo.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ package.json
```

---

## 📦 Scripts
En la raíz:
- `pnpm dev` — ejecuta `dev` en apps en paralelo (con turbo).
- `pnpm build` — build de todo (export estático por defecto).
- `pnpm lint` — placeholder, añade tu config.
- `pnpm new <nombre>` — crea `apps/<nombre>` desde `apps/_template`  
  (atajo de `node ./scripts/new-landing.mjs <nombre>`).

---

## 🧰 Crear una nueva landing (detallado)

### Opción A — Script (recomendada)
```bash
pnpm new landing-fiestas
pnpm dev --filter landing-fiestas
```
- Título inicial opcional:
```bash
APP_TITLE="Landing Fiestas" pnpm new landing-fiestas
```

### Opción B — Manual
```bash
cp -R apps/_template apps/mi-landing
# Edita apps/mi-landing/package.json -> "name": "mi-landing"
# Edita apps/mi-landing/src/app/layout.tsx -> metadata.title/description
pnpm dev --filter mi-landing
```

---

## 🎨 Aislamiento de estilos por landing
Cada app **no comparte CSS global** con otras:
- **`src/app/globals.css`** propio por app.
- **CSS Modules** por componente (ej: `Hero.module.css`).  
- **Tailwind** con config por app (`tailwind.config.ts`), pero usando un **preset compartido**:
  ```ts
  // apps/<landing>/tailwind.config.ts
  import type { Config } from "tailwindcss";
  import preset from "@acme/tailwind-preset";

  export default {
    content: ["./src/**/*.{ts,tsx}", "../../packages/**/*.{ts,tsx}"],
    presets: [preset]
  } satisfies Config;
  ```

> **Importante:** el `content` incluye `../../packages/**` para que Tailwind
> procese clases usadas dentro de `@acme/ui`.

---

## ♻️ Compartir packages
- **UI** (`@acme/ui`):
  ```tsx
  import { Button, Card } from "@acme/ui";
  ```
  Añade componentes en `packages/ui/src/*` y reexporta en `index.ts`.

- **Config** (`@acme/config`): tipos/constantes comunes.
- **Tailwind preset** (`@acme/tailwind-preset`): tokens y tema base.
  - Puedes **extender** por app en su `tailwind.config.ts`:
    ```ts
    export default {
      presets: [preset],
      theme: {
        extend: {
          colors: { brand: "#0ea5e9" }
        }
      }
    }
    ```

---

## 🏗️ Build y export estático
Por defecto, cada app tiene en `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@acme/ui", "@acme/config", "@acme/tailwind-preset"],
  output: "export" // <- genera /out
};
export default nextConfig;
```
Build:
```bash
pnpm --filter <landing> build
# output en apps/<landing>/out
```

### ¿Necesitas SSR?
Quita `output: "export"` en esa app y usa `pnpm --filter <landing> build && pnpm --filter <landing> start`.
Puedes mantener algunas landings estáticas y otras con SSR dentro del mismo monorepo.

---

## 🚢 Deploy rápido (estático)
- **Vercel / Cloudflare Pages / Netlify / S3**: sube el contenido de `apps/<landing>/out`.
- Cualquier CDN o hosting de estáticos sirve.

---

## 🧩 Path alias y assets
- Alias `@/*` → `apps/<landing>/src/*` (ver `tsconfig.json` de cada app).
- Archivos estáticos por app en `apps/<landing>/public` (crea la carpeta si la necesitas).

---

## 🧪 Consejos y buenas prácticas
- Un componente nuevo común → crear en `packages/ui` (evitas duplicación).
- Tokens de marca (colores, radios) → `packages/tailwind-preset`.
- Overrides visuales por campaña/sede → extiende `theme` por app.
- Usa `turbo run dev --filter <landing>` para no levantar todo si no lo necesitas.

---

## 🛠️ Troubleshooting

### ❌ “Named export 'defineConfig' not found” en `next.config.mjs`
Solución: **no** uses `defineConfig` (es de Vite). Usa export por defecto:
```js
/** @type {import('next').NextConfig} */
const nextConfig = { /* ... */ };
export default nextConfig;
```

### ❌ Tailwind no aplica clases de `@acme/ui`
Asegúrate que el `content` de Tailwind en cada app incluya `../../packages/**/*.{ts,tsx}`.

### ❌ “Module not found” al importar `@acme/*`
Ejecuta desde la raíz:
```bash
pnpm install
pnpm dev --filter <landing>
```
y confirma que los packages existen y exportan en su `package.json` (`"exports"`).

### ❌ Node/pnpm incompatibles
Respeta versiones de `engines` en el `package.json` raíz.  
Actualiza si es necesario:
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 📘 ¿Dónde está el script?
- **Ruta:** `scripts/new-landing.mjs` (en la **raíz** del repo).
- **Atajo** en `package.json` (raíz):
  ```json
  {
    "scripts": {
      "new": "node ./scripts/new-landing.mjs"
    }
  }
  ```
- **Uso:**
  ```bash
  pnpm new mi-landing
  APP_TITLE="Mi Título" pnpm new mi-landing
  ```

---

## ✅ Roadmap opcional
- Añadir `eslint` y `prettier` compartidos (`@acme/eslint-config`).
- Tema multi-brand desde variables CSS por app.
- CI con Turbo Remote Cache.
- Storybook en `packages/ui`.
