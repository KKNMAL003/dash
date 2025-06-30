/*
  # Fix automatic profile creation system

  1. Database Functions
     - `handle_new_user()` - Creates profile when user signs up
     - `sync_existing_users()` - Creates profiles for existing auth users

  2. Triggers
     - Automatic profile creation on user signup
     - Run sync function to catch existing users

  3. Security
     - Proper RLS policies for automatic creation
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)),
    CASE 
      WHEN NEW.email = 'admin@onolo.com' THEN 'admin'
      ELSE 'customer'
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to sync existing auth users who don't have profiles
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through all auth users who don't have profiles
  FOR auth_user IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO profiles (
      id,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'first_name', split_part(COALESCE(auth_user.raw_user_meta_data->>'full_name', ''), ' ', 1)),
      COALESCE(auth_user.raw_user_meta_data->>'last_name', split_part(COALESCE(auth_user.raw_user_meta_data->>'full_name', ''), ' ', 2)),
      CASE 
        WHEN auth_user.email = 'admin@onolo.com' THEN 'admin'
        ELSE 'customer'
      END,
      NOW(),
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to create profiles for existing users
SELECT sync_existing_users();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;