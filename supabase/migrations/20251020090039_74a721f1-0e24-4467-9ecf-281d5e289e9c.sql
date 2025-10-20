-- Drop and recreate the has_permission function with proper logic
DROP FUNCTION IF EXISTS public.has_permission(uuid, text);

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_override boolean;
  _override_granted boolean;
  _has_role_permission boolean;
BEGIN
  -- Check if there's a user-specific override
  SELECT 
    true,
    is_granted
  INTO
    _has_override,
    _override_granted
  FROM user_permission_overrides
  WHERE user_id = _user_id
    AND permission_key = _permission_key
  LIMIT 1;

  -- If there's an override, use that
  IF _has_override THEN
    RETURN _override_granted;
  END IF;

  -- Otherwise, check role-based permissions
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND rp.permission_key = _permission_key
      AND rp.is_granted = true
  ) INTO _has_role_permission;

  RETURN _has_role_permission;
END;
$$;