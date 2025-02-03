/*
  # Add new features support

  1. New Tables
    - subjects (教科タグ)
    - user_roles (ユーザー権限)
    - pinned_comments (固定コメント)
    - user_stats (ユーザー統計)

  2. Changes
    - Add subject_id to questions table
    - Add is_banned column to profiles table
    - Add role_id to profiles table
*/

-- Create subjects table
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create pinned_comments table
CREATE TABLE pinned_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_stats table
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  questions_count int DEFAULT 0,
  answers_count int DEFAULT 0,
  helpful_votes int DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES user_roles(id);

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES subjects(id);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects
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

-- RLS Policies for user_roles
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

-- RLS Policies for pinned_comments
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

-- RLS Policies for user_stats
CREATE POLICY "Stats are viewable by everyone"
  ON user_stats FOR SELECT
  USING (true);

CREATE POLICY "System can update stats"
  ON user_stats FOR UPDATE
  USING (true);

-- Insert default roles
INSERT INTO user_roles (name) VALUES
  ('user'),
  ('admin')
ON CONFLICT (name) DO NOTHING;

-- Insert default subjects
INSERT INTO subjects (name) VALUES
  ('数学'),
  ('物理'),
  ('化学'),
  ('生物'),
  ('英語'),
  ('国語'),
  ('社会'),
  ('情報')
ON CONFLICT (name) DO NOTHING;