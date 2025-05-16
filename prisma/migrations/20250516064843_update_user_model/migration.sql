-- First, add the new columns as nullable
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows with default values
UPDATE "User" SET "email" = 'user' || id || '@example.com' WHERE "email" IS NULL;
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- Make the columns required
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");

-- Remove old columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "profilePic";
ALTER TABLE "User" DROP COLUMN IF EXISTS "background";

-- Rename profileImage if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'profileImage') THEN
        ALTER TABLE "User" ADD COLUMN "profileImage" TEXT;
    END IF;
END $$; 