-- Un solo dispositivo por usuario: al iniciar sesión, revocar el resto de sesiones
--
-- OPCIÓN A (si tienes plan Pro): Dashboard > Auth > Sessions > "Single session per user" = ON
--
-- OPCIÓN B: Ejecutar este SQL manualmente en SQL Editor (Dashboard > SQL Editor)

CREATE OR REPLACE FUNCTION auth.revoke_other_sessions_on_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  DELETE FROM auth.refresh_tokens
  WHERE user_id = NEW.user_id
    AND id != NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_refresh_token_insert_single_session ON auth.refresh_tokens;
CREATE TRIGGER on_refresh_token_insert_single_session
  AFTER INSERT ON auth.refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION auth.revoke_other_sessions_on_login();
