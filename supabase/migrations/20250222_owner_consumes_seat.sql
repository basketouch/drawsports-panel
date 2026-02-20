-- Owner puede ocupar o liberar su plaza de licencia
-- consumes_seat: true = owner ocupa una plaza; false = owner no consume (libera para otros)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consumes_seat boolean DEFAULT true;
COMMENT ON COLUMN profiles.consumes_seat IS 'Si true, el usuario consume una plaza de licencia. Owner puede liberar (false) para dar plaza a miembros.';
