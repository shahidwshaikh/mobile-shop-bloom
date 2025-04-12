
-- Function to get wishlist status for a specific product and user
CREATE OR REPLACE FUNCTION public.get_wishlist_status(p_product_id TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.wishlists 
    WHERE product_id = p_product_id::UUID AND user_id = p_user_id
  );
END;
$$;

-- Function to add a product to wishlist
CREATE OR REPLACE FUNCTION public.add_to_wishlist(p_product_id TEXT, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.wishlists (user_id, product_id)
  VALUES (p_user_id, p_product_id::UUID)
  ON CONFLICT (user_id, product_id) DO NOTHING;
END;
$$;

-- Function to remove a product from wishlist
CREATE OR REPLACE FUNCTION public.remove_from_wishlist(p_product_id TEXT, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.wishlists 
  WHERE product_id = p_product_id::UUID AND user_id = p_user_id;
END;
$$;

-- Function to delete a wishlist item by id
CREATE OR REPLACE FUNCTION public.delete_wishlist_item(p_wishlist_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.wishlists WHERE id = p_wishlist_id;
END;
$$;

-- Function to get all wishlist items for a user with product details
CREATE OR REPLACE FUNCTION public.get_user_wishlist(p_user_id UUID)
RETURNS TABLE (
  wishlist_id UUID,
  id UUID,
  name TEXT,
  price NUMERIC,
  image TEXT,
  category TEXT,
  in_stock BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id as wishlist_id, p.id, p.name, p.price, p.image, p.category, p.in_stock
  FROM public.wishlists w
  JOIN public.products p ON w.product_id = p.id
  WHERE w.user_id = p_user_id;
END;
$$;
