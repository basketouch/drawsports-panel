-- Añadir fecha de compra/inicio de suscripción a profiles
-- Ejecutar en Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_start timestamptz;

COMMENT ON COLUMN profiles.subscription_start IS 'Fecha de compra o inicio de suscripción (desde Lemon Squeezy)';
