# Guía paso a paso: Panel DrawSports (panel.drawsports.app)

## Problema: carpeta con `#`

El carácter `#` en la ruta `#VideoDraw` provoca errores en el build de Next.js. Hay que trabajar con el panel en una carpeta **sin** `#`.

---

## Paso 1: Mover el panel fuera de #VideoDraw

1. Abre el Finder y ve a: `Desktop` → `Desarrollo APPs`
2. Crea una carpeta nueva llamada: **`drawsports-panel`**
3. Copia **todo el contenido** de la carpeta `#VideoDraw/panel/` dentro de `drawsports-panel/`
   - Debe quedar: `Desarrollo APPs/drawsports-panel/package.json`, `app/`, `supabase/`, etc.

O en Terminal:

```bash
cd ~/Desktop/Desarrollo\ APPs
mkdir -p drawsports-panel
cp -r "#VideoDraw/panel/"* drawsports-panel/
```

---

## Paso 2: Instalar dependencias

```bash
cd ~/Desktop/Desarrollo\ APPs/drawsports-panel
npm install
```

---

## Paso 3: Configurar variables de entorno

1. En `drawsports-panel/` ya existe `.env.local`
2. Comprueba que tenga (ajusta si hace falta):

```
NEXT_PUBLIC_SUPABASE_URL=https://zezvxjrjpufvpqneafhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9xnKp4gsXtAVGwvF82r2Aw_Drnd3lFK
```

---

## Paso 4: Probar en local

```bash
cd ~/Desktop/Desarrollo\ APPs/drawsports-panel
npm run dev
```

Abre http://localhost:3001 y prueba login y dashboard.

---

## Paso 5: Política RLS en Supabase

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard)
2. Proyecto: **zezvxjrjpufvpqneafhr**
3. Menú **SQL Editor** → **New query**
4. Pega y ejecuta:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

(Si la política ya existe, Supabase mostrará un aviso; puedes ignorarlo.)

---

## Paso 6: Redirect URLs en Supabase Auth

1. En Supabase: **Authentication** → **URL Configuration**
2. En **Redirect URLs**, añade:
   - `https://panel.drawsports.app/**`
   - `http://localhost:3001/**`
3. Guarda los cambios.

---

## Paso 7: Crear proyecto en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión
2. **Add New** → **Project**
3. Importa el repo (o sube la carpeta `drawsports-panel`):
   - Si usas Git: conecta el repo y en **Root Directory** pon `drawsports-panel` (o la ruta donde esté el panel)
   - Si subes carpeta: arrastra `drawsports-panel` como proyecto nuevo

---

## Paso 8: Variables de entorno en Vercel

1. En el proyecto de Vercel: **Settings** → **Environment Variables**
2. Añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://zezvxjrjpufvpqneafhr.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
3. Marca **Production**, **Preview** y **Development**
4. Guarda.

---

## Paso 9: Desplegar

1. **Deployments** → **Redeploy** (o haz un push si usas Git)
2. Espera a que termine el build
3. Comprueba la URL temporal (ej. `tu-proyecto.vercel.app`)

---

## Paso 10: Dominio panel.drawsports.app

1. En Vercel: **Settings** → **Domains** → **Add**
2. Escribe: `panel.drawsports.app`
3. Vercel te dará instrucciones DNS
4. En tu proveedor de dominio (donde gestionas drawsports.app):
   - Tipo: **CNAME**
   - Nombre: `panel`
   - Valor: `cname.vercel-dns.com` (o el que indique Vercel)
5. Guarda y espera la propagación DNS (puede tardar minutos u horas)

---

## Resumen de pasos

| # | Acción |
|---|--------|
| 1 | Mover panel a `drawsports-panel` (sin `#` en la ruta) |
| 2 | `npm install` |
| 3 | Revisar `.env.local` |
| 4 | `npm run dev` y probar en local |
| 5 | Ejecutar SQL RLS en Supabase |
| 6 | Añadir redirect URLs en Supabase Auth |
| 7 | Crear proyecto en Vercel |
| 8 | Añadir variables de entorno en Vercel |
| 9 | Desplegar |
| 10 | Configurar dominio `panel.drawsports.app` |
