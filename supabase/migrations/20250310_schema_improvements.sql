-- =============================================================================
-- Mejoras de esquema: accepted_at, expires_at, updated_at triggers, created_at
-- =============================================================================

-- 1. organization_invites: accepted_at, expires_at, índice en status
ALTER TABLE organization_invites
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE organization_invites
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

CREATE INDEX IF NOT EXISTS idx_org_invites_status ON organization_invites(status);

COMMENT ON COLUMN organization_invites.accepted_at IS 'Cuándo se aceptó la invitación (al registrarse el usuario)';
COMMENT ON COLUMN organization_invites.expires_at IS 'Caducidad de la invitación (7 días por defecto)';

-- 2. Actualizar handle_new_user para setear accepted_at al aceptar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_rec record;
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;

  -- Si hay invitación pendiente para este email, añadir a la org
  SELECT oi.organization_id, o.subscription_start, o.subscription_end
  INTO invite_rec
  FROM organization_invites oi
  JOIN organizations o ON o.id = oi.organization_id
  WHERE LOWER(oi.email) = LOWER(new.email) AND oi.status = 'pending'
  LIMIT 1;

  IF invite_rec.organization_id IS NOT NULL THEN
    UPDATE profiles
    SET organization_id = invite_rec.organization_id,
        organization_role = 'member',
        is_pro = true,
        subscription_start = invite_rec.subscription_start,
        subscription_end = invite_rec.subscription_end
    WHERE id = new.id;

    UPDATE organization_invites
    SET status = 'accepted', accepted_at = now()
    WHERE LOWER(email) = LOWER(new.email) AND organization_id = invite_rec.organization_id AND status = 'pending';
  END IF;

  RETURN new;
END;
$$;

-- 3. organizations: trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. profiles: created_at, updated_at + trigger
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN profiles.created_at IS 'Cuándo se creó el perfil';
COMMENT ON COLUMN profiles.updated_at IS 'Última modificación del perfil';
