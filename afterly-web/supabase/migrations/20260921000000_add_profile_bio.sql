ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT
  CHECK (char_length(bio) <= 160);

UPDATE profiles
SET full_name = 'Vansh',
    college = 'JSS University, Noida',
    bio = 'Building Afterly — the platform for curated college nights in India.',
    verified = true,
    trust_score = 5.0
WHERE id = '00000000-0000-0000-0000-000000000001';