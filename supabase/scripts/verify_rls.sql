-- =============================================================================
-- Script para verificar RLS en profiles, organizations, organization_invites
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- 1. Ver políticas actuales en profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Ver políticas actuales en organizations
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- 3. Ver políticas actuales en organization_invites
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'organization_invites'
ORDER BY policyname;

-- 4. Simular lectura como usuario específico (reemplaza USER_UUID por un id real de auth.users)
-- Ejemplo: SET LOCAL role = 'authenticated'; SET LOCAL request.jwt.claim.sub = 'uuid-del-usuario';
-- O usar: SELECT * FROM profiles WHERE id = 'UUID' con el service role para ver si existe

-- 5. Verificar que get_my_organization_id existe y funciona
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'get_my_organization_id';

-- 6. Contar perfiles sin organization_id (usuarios que podrían tener problemas de RLS en org)
SELECT COUNT(*) AS perfiles_sin_org FROM profiles WHERE organization_id IS NULL;

-- 7. Contar perfiles con organization_id
SELECT COUNT(*) AS perfiles_con_org FROM profiles WHERE organization_id IS NOT NULL;

-- 8. Ver estructura de profiles (columnas)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 9. Ver estructura de organizations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'organizations'
ORDER BY ordinal_position;
