# Desplegar DrawSports WebPanel a GitHub y Vercel

## Estado actual

- ✅ Proyecto con Git inicializado
- ✅ Commit limpio (sin `.env.local`, `node_modules` ni `.next`)
- ✅ `.gitignore` configurado correctamente

---

## Paso 1: Crear el repositorio en GitHub

1. Entra en **https://github.com/new**
2. **Repository name**: `drawsports-panel` (o el nombre que prefieras)
3. **Description** (opcional): "Panel de licencias DrawSports PRO"
4. **Visibility**: Private o Public
5. **No marques** "Add a README" ni "Add .gitignore" (ya los tienes)
6. Haz clic en **Create repository**

---

## Paso 2: Conectar y subir el código

Cuando GitHub cree el repo, te mostrará la URL. Usa la de **HTTPS** (ej: `https://github.com/basketouch/drawsports-panel.git`).

En la terminal, ejecuta:

```bash
cd "/Users/jorgelorenzo/Desktop/DrawSports WebPanel"

# Añadir el remote (sustituye DRAWSPORTS-PANEL por el nombre real del repo)
git remote add origin https://github.com/basketouch/drawsports-panel.git

# Subir el código
git push -u origin main
```

---

## Paso 3: Configurar variables de entorno en Vercel

Antes de desplegar, configura las variables de entorno en Vercel:

1. En el proyecto de Vercel → **Settings** → **Environment Variables**
2. Añade las mismas variables que tienes en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (y cualquier otra que use el panel)

---

## Paso 4: Desplegar en Vercel

**Opción A – Desde la web de Vercel**

1. Ve a **https://vercel.com/new**
2. Importa el repositorio `drawsports-panel` (o el nombre que hayas usado)
3. Vercel detectará Next.js automáticamente
4. Añade el dominio `panel.drawsports.app` en **Settings** → **Domains**

**Opción B – Desde la terminal**

```bash
cd "/Users/jorgelorenzo/Desktop/DrawSports WebPanel"
vercel
```

---

## Importante: `.env.local`

El archivo `.env.local` **no se sube** a GitHub (está en `.gitignore`). Las credenciales deben configurarse en Vercel como variables de entorno para que el panel funcione en producción.
