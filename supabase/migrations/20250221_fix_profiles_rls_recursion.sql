-- Fix: infinite recursion en política "Users can read profiles in same org"
-- La subquery SELECT FROM profiles dispara RLS de nuevo. Usamos función SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS "Users can read profiles in same org" ON profiles;
CREATE POLICY "Users can read profiles in same org"
  ON profiles
  FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = public.get_my_organization_id()
  );
