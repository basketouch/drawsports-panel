# DrawSports PRO - Panel de licencias

Panel web para clientes PRO en **panel.drawsports.app**. Login con Supabase Auth y visualización del estado de la licencia.

## Requisitos

- Node.js 18+
- Cuenta Supabase (proyecto DrawSports)

## Instalación

```bash
cd panel
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```
NEXT_PUBLIC_SUPABASE_URL=https://zezvxjrjpufvpqneafhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001).

## Nota sobre el build local

Si la ruta del proyecto contiene `#` (ej. `#VideoDraw`), el build local puede fallar por un bug de webpack. El despliegue en Vercel funciona correctamente.

## Despliegue en Vercel

### Opción A: Proyecto separado (recomendado)

1. Crea un nuevo proyecto en [Vercel](https://vercel.com)
2. Conecta el repositorio (o sube la carpeta `panel/`)
3. **Root Directory:** `panel`
4. **Framework Preset:** Next.js
5. Añade las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Despliega

### Opción B: Monorepo con Web

Si `panel/` está en el mismo repo que `Web/`:

1. Crea un **segundo proyecto** en Vercel para el panel
2. Mismo repo, pero **Root Directory:** `panel`
3. Configura el dominio: `panel.drawsports.app`

### Dominio panel.drawsports.app

1. En Vercel: **Settings** → **Domains** → **Add**
2. Dominio: `panel.drawsports.app`
3. En tu proveedor DNS, añade un registro **CNAME**:
   - Nombre: `panel`
   - Valor: `cname.vercel-dns.com` (o el que indique Vercel)

### Supabase Auth

En **Supabase** → **Authentication** → **URL Configuration**, añade a **Redirect URLs**:

- `https://panel.drawsports.app/**`
- `http://localhost:3001/**` (para desarrollo)

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing: login, registro o redirect a dashboard |
| `/login` | Inicio de sesión |
| `/signup` | Registro de nueva cuenta |
| `/dashboard` | Estado de la licencia |
| `/auth/callback` | Callback OAuth (si se usa en el futuro) |

## Tabla profiles

El panel lee de la tabla `profiles` en Supabase:

- `id` (uuid) - FK a auth.users
- `email` (text)
- `is_pro` (boolean)
- `subscription_start` (timestamptz, opcional) - Fecha de compra
- `subscription_end` (timestamptz, opcional) - Fecha fin / renovación
- `organization_id` (text, opcional)

El webhook de Lemon Squeezy actualiza `is_pro`, `subscription_start` y `subscription_end` cuando el cliente paga. Ejecuta la migración `supabase/migrations/20250219_profiles_subscription_start.sql` si no tienes la columna.

## Seguridad

- RLS en Supabase: los usuarios solo pueden leer su propia fila en `profiles`
- El panel usa la clave `anon`; las políticas RLS restringen el acceso
