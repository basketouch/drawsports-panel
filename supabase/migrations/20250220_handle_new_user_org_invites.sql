-- Asegurar que handle_new_user añade invitados a la org al registrarse
-- (por si trigger_profiles_on_signup sobrescribió la versión de organization_invites)
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
