/*
  # Add image and math content support

  1. Changes
    - Add `images` array column to questions table
    - Add `math_content` text column to questions table
    - Add `images` array column to answers table
    - Add `math_content` text column to answers table

  2. Notes
    - Images are stored as an array of URLs
    - Math content is stored as LaTeX strings
*/

-- Add columns to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS math_content text;

-- Add columns to answers table
ALTER TABLE answers
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS math_content text;

-- Enable storage
INSERT INTO storage.buckets (id, name)
VALUES ('images', 'images')
ON CONFLICT DO NOTHING;

-- Set up storage policy
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);