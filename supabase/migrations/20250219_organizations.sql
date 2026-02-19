-- Tabla organizations: licencias multi-usuario (3, 5, 10 plazas)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mi equipo',
  seats_limit int NOT NULL CHECK (seats_limit > 0),
  subscription_start timestamptz,
  subscription_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Añadir organization_id y organization_role a profiles si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_role text CHECK (organization_role IN ('owner', 'member'));

-- Índice para buscar miembros de una org
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id) WHERE organization_id IS NOT NULL;

-- RLS: los miembros de una org pueden leer su organización
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read own organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Solo el owner puede actualizar (invitar, etc.) - se hará vía service role en el panel
CREATE POLICY "Owners can update own organization"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND organization_role = 'owner'
    )
  );

COMMENT ON TABLE organizations IS 'Organizaciones/equipos con licencias PRO (3, 5 o 10 usuarios)';
COMMENT ON COLUMN organizations.seats_limit IS 'Número de plazas según plan comprado (3, 5 o 10)';

-- Función: owner añade miembro por email (SECURITY DEFINER para poder actualizar otro profile)
CREATE OR REPLACE FUNCTION add_organization_member(org_id uuid, member_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_profile_id uuid;
  current_count int;
  target_profile_id uuid;
BEGIN
  -- Verificar que el caller es owner de la org
  SELECT id INTO owner_profile_id
  FROM profiles
  WHERE organization_id = org_id AND organization_role = 'owner' AND id = auth.uid();
  IF owner_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No eres el administrador de este equipo');
  END IF;

  -- Contar miembros actuales
  SELECT COUNT(*) INTO current_count FROM profiles WHERE organization_id = org_id;
  IF current_count >= (SELECT seats_limit FROM organizations WHERE id = org_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'No hay plazas disponibles');
  END IF;

  -- Buscar profile por email (case insensitive)
  SELECT id INTO target_profile_id FROM profiles WHERE LOWER(email) = LOWER(member_email);
  IF target_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado. Debe registrarse primero en panel.drawsports.app');
  END IF;

  -- No añadir si ya está en una org
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_profile_id AND organization_id IS NOT NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'El usuario ya pertenece a otro equipo');
  END IF;

  -- Añadir como miembro
  UPDATE profiles
  SET organization_id = org_id, organization_role = 'member', is_pro = true,
      subscription_start = (SELECT subscription_start FROM organizations WHERE id = org_id),
      subscription_end = (SELECT subscription_end FROM organizations WHERE id = org_id)
  WHERE id = target_profile_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION add_organization_member(uuid, text) TO authenticated;
