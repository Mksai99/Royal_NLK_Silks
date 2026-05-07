-- WIPE PUBLIC SCHEMA
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore standard permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
