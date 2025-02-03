/*
  # Add roles and subjects with safe migrations

  1. Changes
    - Safely add new columns to existing tables
    - Add RLS policies
    - Insert default data

  2. Security
    - Enable RLS on new tables
    - Add admin-only policies for sensitive operations
*/

-- Add new columns to existing tables (these are safe to run multiple times)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES user_roles(id);

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES subjects(id);

-- Create or update RLS policies
DO $$ 
BEGIN
    -- Subjects policies
    DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON subjects;
    DROP POLICY IF EXISTS "Only admins can modify subjects" ON subjects;
    
    CREATE POLICY "Subjects are viewable by everyone"
      ON subjects FOR SELECT
      USING (true);

    CREATE POLICY "Only admins can modify subjects"
      ON subjects FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          JOIN user_roles r ON p.role_id = r.id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      );

    -- User roles policies
    DROP POLICY IF EXISTS "Roles are viewable by everyone" ON user_roles;
    DROP POLICY IF EXISTS "Only admins can modify roles" ON user_roles;

    CREATE POLICY "Roles are viewable by everyone"
      ON user_roles FOR SELECT
      USING (true);

    CREATE POLICY "Only admins can modify roles"
      ON user_roles FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          JOIN user_roles r ON p.role_id = r.id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      );

    -- Create pinned_comments if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pinned_comments') THEN
        CREATE TABLE pinned_comments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          content text NOT NULL,
          created_by uuid REFERENCES profiles(id) NOT NULL,
          created_at timestamptz DEFAULT now()
        );

        ALTER TABLE pinned_comments ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Pinned comments policies
    DROP POLICY IF EXISTS "Pinned comments are viewable by everyone" ON pinned_comments;
    DROP POLICY IF EXISTS "Only admins can modify pinned comments" ON pinned_comments;

    CREATE POLICY "Pinned comments are viewable by everyone"
      ON pinned_comments FOR SELECT
      USING (true);

    CREATE POLICY "Only admins can modify pinned comments"
      ON pinned_comments FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          JOIN user_roles r ON p.role_id = r.id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      );

    -- Create user_stats if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_stats') THEN
        CREATE TABLE user_stats (
          user_id uuid PRIMARY KEY REFERENCES profiles(id),
          questions_count int DEFAULT 0,
          answers_count int DEFAULT 0,
          helpful_votes int DEFAULT 0,
          last_updated timestamptz DEFAULT now()
        );

        ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
    END IF;

    -- User stats policies
    DROP POLICY IF EXISTS "Stats are viewable by everyone" ON user_stats;
    DROP POLICY IF EXISTS "System can update stats" ON user_stats;

    CREATE POLICY "Stats are viewable by everyone"
      ON user_stats FOR SELECT
      USING (true);

    CREATE POLICY "System can update stats"
      ON user_stats FOR UPDATE
      USING (true);

END $$;

-- Insert default roles if they don't exist
INSERT INTO user_roles (name)
VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

-- Insert default subjects if they don't exist
INSERT INTO subjects (name)
VALUES 
  ('数学'),
  ('物理'),
  ('化学'),
  ('生物'),
  ('英語'),
  ('国語'),
  ('社会'),
  ('情報')
ON CONFLICT (name) DO NOTHING;

-- Create function to initialize user_stats if it doesn't exist
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created'
  ) THEN
    CREATE TRIGGER on_profile_created
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION initialize_user_stats();
  END IF;
END $$;