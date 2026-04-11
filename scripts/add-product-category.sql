-- Safe migration to add category support for auction products
-- Run this on existing databases.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS category VARCHAR(64);

-- Backfill existing rows to keep legacy records valid.
UPDATE products
SET category = 'collectibles'
WHERE category IS NULL OR TRIM(category) = '';

-- Normalize known label variants if present.
UPDATE products SET category = 'luxury goods' WHERE category = 'luxuty goods';
UPDATE products SET category = 'furniture' WHERE category = 'furnitures';

-- Restrict category values to approved taxonomy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_check'
      AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_check
      CHECK (category IN (
        'electronics',
        'collectibles',
        'luxury goods',
        'real estate and property',
        'furniture'
      ));
  END IF;
END $$;

-- Enforce non-null after backfill.
ALTER TABLE products
ALTER COLUMN category SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
