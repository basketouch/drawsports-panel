-- RLS para organizations: usuarios pueden leer su organización
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas si ya existen (para poder re-ejecutar)
DROP POLICY IF EXISTS "Users can read own organization" ON organizations;
DROP POLICY IF EXISTS "Owners can update own organization" ON organizations;

-- Usuarios pueden leer la organización a la que pertenecen
CREATE POLICY "Users can read own organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

-- Solo owners pueden actualizar (nombre, etc.)
CREATE POLICY "Owners can update own organization"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND organization_role = 'owner'
    )
  );
