# Migrar panel.drawsports.app a Vercel

Guía para desplegar el panel PRO en Vercel y que funcionen todas las URLs.

---

## URLs que deben funcionar

| URL | Comportamiento |
|-----|----------------|
| `panel.drawsports.app` | → Redirige a `/es/login` o `/es/dashboard` según auth |
| `panel.drawsports.app/` | Igual que arriba |
| `panel.drawsports.app/es` | → `/es/login` o `/es/dashboard` |
| `panel.drawsports.app/en` | → `/en/login` o `/en/dashboard` |
| `panel.drawsports.app/es/login` | Login en español |
| `panel.drawsports.app/en/login` | Login en inglés |
| `panel.drawsports.app/es/dashboard` | Dashboard (requiere auth) |
| `panel.drawsports.app/en/dashboard` | Dashboard (requiere auth) |
| `panel.drawsports.app/auth/verify` | Callback Supabase (magic link, OAuth) |
| `panel.drawsports.app/update-password` | Actualizar contraseña |

---

## Paso 1: Conectar el repositorio a Vercel

1. Entra en **[vercel.com/new](https://vercel.com/new)**
2. **Import Git Repository**: selecciona el repo `drawsports-panel` (ej. `basketouch/drawsports-panel`)
3. **Root Directory**: deja vacío (el panel es la raíz del repo)
4. **Framework Preset**: Next.js (Vercel lo detecta automáticamente)
5. Haz clic en **Deploy** (puede fallar la primera vez si faltan variables de entorno; configúralas y redeploy)

---

## Paso 2: Variables de entorno

En **Settings** → **Environment Variables** del proyecto Vercel, añade:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zezvxjrjpufvpqneafhr.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu clave anon de Supabase | Production, Preview |

Obtén las claves en: **Supabase** → Tu proyecto → **Settings** → **API**.

---

## Paso 3: Dominio panel.drawsports.app

1. En Vercel: **Settings** → **Domains** → **Add**
2. Escribe: `panel.drawsports.app`
3. Vercel te dará instrucciones DNS. En tu proveedor de dominio (donde gestionas drawsports.app):
   - Añade un registro **CNAME**:
     - **Nombre/Host**: `panel`
     - **Valor/Destino**: `cname.vercel-dns.com` (o el que indique Vercel)
4. Espera a que el DNS propague (puede tardar unos minutos)

---

## Paso 4: Supabase – Migraciones

Si ves "Error al cargar el panel" en `/es/dashboard`, suele ser porque faltan columnas en la tabla `profiles`. Ejecuta las migraciones en Supabase:

1. **Supabase Dashboard** → Tu proyecto → **SQL Editor**
2. Ejecuta los archivos de `supabase/migrations/` en orden (por fecha en el nombre):
   - `20250218_rls_profiles_panel.sql`
   - `20250219_organizations.sql`
   - `20250219_organization_invites.sql`
   - etc.

O usa la CLI: `supabase db push` si tienes el proyecto vinculado.

---

## Paso 5: Supabase – Redirect URLs

En **Supabase** → **Authentication** → **URL Configuration** → **Redirect URLs**, añade:

```
https://panel.drawsports.app/**
http://localhost:3001/**
```

Y en **Site URL** (opcional, si quieres que los emails de Supabase apunten al panel):

```
https://panel.drawsports.app
```

---

## Paso 6: Redeploy

Tras configurar variables y dominio:

1. **Deployments** → último deployment → **Redeploy**
2. O haz un nuevo push al repo para que Vercel despliegue automáticamente

---

## Verificación

| Acción | Resultado esperado |
|--------|-------------------|
| Visitar `panel.drawsports.app` | Redirige a login o dashboard |
| Visitar `panel.drawsports.app/es` | Login en español |
| Visitar `panel.drawsports.app/en` | Login en inglés |
| Clic en "Acceder" en drawsports.app/pro | Abre panel en español |
| Clic en "Sign in" en drawsports.app/pro/en | Abre panel en inglés |
| Magic link / recuperar contraseña | Llega a `/auth/verify` y funciona |

---

## Enlaces desde la web

La web principal (`Web/pro/`) enlaza a:

- **Español**: `https://panel.drawsports.app/es`
- **Inglés**: `https://panel.drawsports.app/en`

El middleware del panel redirige `/es` y `/en` a `/es/login` o `/en/login` (o dashboard si ya está autenticado).

---

## Troubleshooting

### Build falla por ruta con `#`
Si el proyecto está en una ruta con `#` (ej. `#VideoDraw`), el build local puede fallar con un error de webpack. **El build en Vercel funciona correctamente** porque Vercel clona el repo en un entorno limpio sin el `#` en la ruta. No hace falta mover el proyecto.

### 404 en rutas
El middleware maneja `/`, `/es`, `/en`, `/login`, `/dashboard`, etc. Si algo no redirige bien, revisa `middleware.ts`.

### Supabase no redirige bien
Comprueba que `https://panel.drawsports.app/**` esté en **Redirect URLs** de Supabase.

### "Error al cargar el panel" en el dashboard
1. **Migraciones**: Ejecuta las migraciones de `supabase/migrations/` en Supabase (Paso 4).
2. **Ver el error real**: En Vercel → **Settings** → **Environment Variables**, añade `NEXT_PUBLIC_DEBUG_ERRORS` = `1`. Redeploy. La página mostrará el mensaje de error real.
