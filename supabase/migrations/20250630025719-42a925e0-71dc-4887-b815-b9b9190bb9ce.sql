
-- Fix the function search path mutable issue for is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = $1
  );
$$;
