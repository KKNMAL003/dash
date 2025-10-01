/*
  # Add Admin User

  1. New User
    - Add user to auth.users table with email selakekana@hotmail.com
    - Set password hash for 'selkek10'
    - Confirm email automatically
    
  2. Admin Profile
    - Create profile with admin role
    - Set basic profile information
    
  3. Security
    - User will have admin privileges
    - Email is pre-confirmed
*/

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'selakekana@hotmail.com',
  crypt('selkek10', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the profile
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'selakekana@hotmail.com';
  
  -- Insert admin profile
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone,
    address,
    role,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'Admin',
    'User',
    null,
    null,
    'admin',
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();
END $$;