-- First, fix duplicate usernames by appending user_id suffix
WITH duplicates AS (
  SELECT id, username, 
         ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
  FROM public.profiles 
  WHERE username IS NOT NULL
)
UPDATE public.profiles p
SET username = d.username || '_' || SUBSTRING(p.id::text, 1, 6)
FROM duplicates d
WHERE p.id = d.id AND d.rn > 1;

-- Now add unique constraint on username
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);