/*
  # Fix user stats RLS policies

  1. Changes
    - Drop existing RLS policies for user_stats
    - Add new policies to allow users to:
      - View their own stats
      - Insert their own stats
      - Update their own stats
    - Add policy for admins to manage all stats
  
  2. Security
    - Users can only access their own stats
    - Admins can access all stats
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Stats are viewable by everyone" ON user_stats;
DROP POLICY IF EXISTS "System can update stats" ON user_stats;

-- Create new policies for user_stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Create trigger function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, questions_count, answers_count, helpful_votes)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();