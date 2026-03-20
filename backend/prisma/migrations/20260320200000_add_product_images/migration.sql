-- Convert images column from JSONB to native TEXT[] (PostgreSQL array)
-- The column already exists as JSONB from a previous migration.
-- Since it contains only empty arrays at this point, we drop and recreate
-- as TEXT[] to match the Prisma String[] type.
ALTER TABLE "products" DROP COLUMN "images";
ALTER TABLE "products" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
