/*
  # Add likes feature and update stats

  1. New Tables
    - `answer_likes`
      - `id` (uuid, primary key)
      - `answer_id` (uuid, references answers)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on answer_likes table
    - Add policies for authenticated users to manage their likes
    - Add trigger to update helpful_votes count in user_stats
*/

-- Create answer_likes table
CREATE TABLE answer_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Enable RLS
ALTER TABLE answer_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes"
  ON answer_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can toggle their own likes"
  ON answer_likes FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update helpful_votes count
CREATE OR REPLACE FUNCTION update_helpful_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats
    SET helpful_votes = helpful_votes + 1
    WHERE user_id = (
      SELECT user_id
      FROM answers
      WHERE id = NEW.answer_id
    );
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats
    SET helpful_votes = helpful_votes - 1
    WHERE user_id = (
      SELECT user_id
      FROM answers
      WHERE id = OLD.answer_id
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for helpful_votes updates
CREATE TRIGGER on_answer_like
  AFTER INSERT OR DELETE ON answer_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_helpful_votes();

-- Create function to update question and answer counts
CREATE OR REPLACE FUNCTION update_user_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE user_stats
      SET questions_count = questions_count + 1
      WHERE user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE user_stats
      SET questions_count = questions_count - 1
      WHERE user_id = OLD.user_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'answers' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE user_stats
      SET answers_count = answers_count + 1
      WHERE user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE user_stats
      SET answers_count = answers_count - 1
      WHERE user_id = OLD.user_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for questions and answers
CREATE TRIGGER on_question_change
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_counts();

CREATE TRIGGER on_answer_change
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_user_counts();