
-- Add a stripe_session_id column to the orders table to track payments
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
