-- Remove the restrictive category check constraint to allow custom categories
ALTER TABLE brain_dumps DROP CONSTRAINT IF EXISTS brain_dumps_category_check;