INSERT INTO public.user_roles (user_id, role)
VALUES ('1a4f2b61-8055-4c64-a418-3adfb7463753', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;