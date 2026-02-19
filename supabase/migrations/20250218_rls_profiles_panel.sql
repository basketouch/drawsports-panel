-- RLS para que los usuarios del panel lean solo su perfil
-- Ejecutar en Supabase SQL Editor si no existe

-- Habilitar RLS en profiles (si no está ya)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuarios autenticados pueden leer su propia fila
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
