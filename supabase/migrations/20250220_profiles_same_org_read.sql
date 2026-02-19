-- Permitir a usuarios leer perfiles de su misma organización (para que el admin vea los miembros)
DROP POLICY IF EXISTS "Users can read profiles in same org" ON profiles;
CREATE POLICY "Users can read profiles in same org"
  ON profiles
  FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
