-- =====================================================
-- Add nim & avatar columns to users
-- =====================================================
ALTER TABLE users ADD COLUMN nim VARCHAR(20) NULL AFTER email;
ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER role;