/*
  # Add default role management

  1. Changes
    - Add trigger to set default user role on profile creation
    - Set default role for existing profiles
    - Update admin role check function

  2. Security
    - Maintains existing RLS policies
    - Ensures proper role assignment
*/

-- Get the user role ID
DO $$ 
DECLARE
    user_role_id uuid;
BEGIN
    SELECT id INTO user_role_id FROM user_roles WHERE name = 'user';
    
    -- Update existing profiles that don't have a role
    UPDATE profiles 
    SET role_id = user_role_id 
    WHERE role_id IS NULL;
END $$;

-- Create or replace the trigger function for setting default role
CREATE OR REPLACE FUNCTION set_default_role()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id uuid;
BEGIN
    -- Get the default user role ID
    SELECT id INTO default_role_id FROM user_roles WHERE name = 'user';
    
    -- Set the default role
    NEW.role_id := default_role_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_default_role_trigger ON profiles;
CREATE TRIGGER set_default_role_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_default_role();

-- Update the is_admin function to be more robust
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles p
        JOIN user_roles r ON p.role_id = r.id
        WHERE p.id = user_id
        AND r.name = 'admin'
        AND p.is_banned = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;