# Admin User Setup Guide for Onolo Group Admin Dashboard

## Overview
The application requires users to have an `admin` role in the `profiles` table to access the dashboard. This guide will help you create an admin user in Supabase.

## Step 1: Create User Account in Supabase Auth

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `lnnqoejqgdmwadtzwuix`

2. **Create a new user**
   - Go to **Authentication** → **Users**
   - Click **"Add User"**
   - Enter your desired email (e.g., `admin@onolo.com` or your email)
   - Set a secure password
   - Click **"Create User"**

3. **Note the User ID**
   - After creating the user, copy the UUID from the users list
   - This will look like: `123e4567-e89b-12d3-a456-426614174000`

## Step 2: Create Admin Profile in Database

1. **Go to SQL Editor**
   - In your Supabase dashboard, go to **SQL Editor**

2. **Run the following SQL command** (replace `YOUR_USER_ID` with the actual UUID from Step 1):

```sql
-- Insert admin profile
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  phone,
  address,
  role,
  created_at,
  updated_at,
  default_delivery_window,
  default_latitude,
  default_longitude
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with actual UUID
  'Admin',
  'User',
  '+1234567890',
  '123 Admin Street, City, State',
  'admin',
  NOW(),
  NOW(),
  '9:00 AM - 5:00 PM',
  40.7128,
  -74.0060
)
ON CONFLICT (id) 
DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  role = EXCLUDED.role,
  updated_at = NOW(),
  default_delivery_window = EXCLUDED.default_delivery_window,
  default_latitude = EXCLUDED.default_latitude,
  default_longitude = EXCLUDED.default_longitude;
```

## Step 3: Verify Admin User Creation

Run this query to confirm the admin user was created:

```sql
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at,
  au.email,
  au.confirmed_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin';
```

## Step 4: Test Login

1. **Go to your app**: http://localhost:5173
2. **Sign in** with the email and password you created in Step 1
3. **You should now have access** to the admin dashboard

## Troubleshooting

### If you still get "Access denied" errors:

1. **Check the user ID matches**:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. **Verify the profile exists**:
   ```sql
   SELECT * FROM profiles WHERE id = 'your-user-id';
   ```

3. **Check the role is set correctly**:
   ```sql
   SELECT id, role FROM profiles WHERE id = 'your-user-id';
   ```

### If the profiles table doesn't exist:

The migration should have created it, but if you need to create it manually:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'driver', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  default_delivery_window TEXT,
  default_latitude DECIMAL,
  default_longitude DECIMAL
);
```

## Security Notes

- The `admin` role gives full access to the dashboard
- Consider creating additional roles (`staff`, `driver`) for limited access
- The application automatically checks the `role` field in the `profiles` table
- Users without an admin profile will be automatically signed out

## Next Steps

After creating your admin user:
1. Test all dashboard features
2. Create additional users as needed
3. Set up proper RLS policies if required
4. Consider adding more granular role-based permissions
