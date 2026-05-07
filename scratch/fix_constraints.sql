-- Drop the cross-schema foreign key that blocks Prisma
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Ensure columns are snake_case if they aren't already
-- (Just in case some tables exist but with wrong names)
-- But actually, let's just drop the constraint for now.
