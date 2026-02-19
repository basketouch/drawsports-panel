-- Tabla de invitaciones pendientes (usuarios que aún no se han registrado)
CREATE TABLE IF NOT EXISTS organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON organization_invites(organization_id);

-- RLS
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage invites"
  ON organization_invites FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND organization_role = 'owner'
    )
  );

-- Actualizar trigger: cuando un usuario se registra, si tiene invitación pendiente, añadirlo a la org
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
    SET status = 'accepted'
    WHERE LOWER(email) = LOWER(new.email) AND organization_id = invite_rec.organization_id AND status = 'pending';
  END IF;

  RETURN new;
END;
$$;
