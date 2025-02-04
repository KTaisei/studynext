/*
  # Fix role policies to prevent infinite recursion

  1. Changes
    - Simplify role-based policies
    - Remove circular dependencies
    - Add basic admin role check function

  2. Security
    - Maintain RLS security
    - Simplify policy logic while keeping security intact
*/

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = user_id
    AND p.role_id IN (SELECT id FROM user_roles WHERE name = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies for subjects
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON subjects;
DROP POLICY IF EXISTS "Only admins can modify subjects" ON subjects;

CREATE POLICY "Subjects are viewable by everyone"
  ON subjects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify subjects"
  ON subjects FOR ALL
  USING (is_admin(auth.uid()));

-- Update policies for user_roles
DROP POLICY IF EXISTS "Roles are viewable by everyone" ON user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON user_roles;

CREATE POLICY "Roles are viewable by everyone"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify roles"
  ON user_roles FOR ALL
  USING (is_admin(auth.uid()));

-- Update policies for pinned_comments
DROP POLICY IF EXISTS "Pinned comments are viewable by everyone" ON pinned_comments;
DROP POLICY IF EXISTS "Only admins can modify pinned comments" ON pinned_comments;

CREATE POLICY "Pinned comments are viewable by everyone"
  ON pinned_comments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify pinned comments"
  ON pinned_comments FOR ALL
  USING (is_admin(auth.uid()));

-- Ensure default roles exist
INSERT INTO user_roles (name)
VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;