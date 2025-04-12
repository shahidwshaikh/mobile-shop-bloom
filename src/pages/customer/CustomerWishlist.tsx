
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/components/products/ProductCard";

interface WishlistItem extends Product {
  wishlist_id: string;
}

const CustomerWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch wishlist items
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate("/customer/login");
        return;
      }
      
      // Using raw SQL function call to avoid type errors with the wishlist table
      const { data, error } = await supabase.rpc('get_user_wishlist', {
        p_user_id: session.session.user.id
      });
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match the WishlistItem type
      const transformedItems: WishlistItem[] = data ? data.map((item: any) => ({
        wishlist_id: item.wishlist_id,
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        inStock: item.in_stock
      })) : [];
      
      setWishlistItems(transformedItems);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string, productName: string) => {
    try {
      // Using raw SQL function call to avoid type errors
      const { error } = await supabase.rpc('delete_wishlist_item', {
        p_wishlist_id: wishlistId
      });
      
      if (error) {
        throw error;
      }
      
      setWishlistItems(wishlistItems.filter(item => item.wishlist_id !== wishlistId));
      
      toast({
        title: "Removed from wishlist",
        description: `${productName} has been removed from your wishlist`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: WishlistItem) => {
    if (!product.inStock) {
      toast({
        title: "Product unavailable",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }
    
    // Get existing cart items from localStorage
    const existingCartStr = localStorage.getItem('cart');
    const existingCart = existingCartStr ? JSON.parse(existingCartStr) : [];
    
    // Check if product is already in cart
    const existingItem = existingCart.find((item: any) => item.id === product.id);
    
    let updatedCart;
    
    if (existingItem) {
      // Increment quantity of existing item (up to max of 5)
      updatedCart = existingCart.map((item: any) => 
        item.id === product.id 
          ? { ...item, quantity: Math.min(item.quantity + 1, 5) } 
          : item
      );
      
      toast({
        title: "Cart updated",
        description: `Quantity of ${product.name} increased in your cart`,
        duration: 2000,
      });
    } else {
      // Add new item to cart
      updatedCart = [
        ...existingCart, 
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }
      ];
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        duration: 2000,
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (loading) {
    return (
      <div className="pb-20">
        <div className="bg-shop-purple text-white p-4">
          <h1 className="text-xl font-bold">My Wishlist</h1>
          <p className="text-sm opacity-90">Products you've saved for later</p>
        </div>
        
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
        </div>
        
        <CustomerNavbar />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">My Wishlist</h1>
        <p className="text-sm opacity-90">Products you've saved for later</p>
      </div>
      
      <div className="p-4">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {wishlistItems.map(product => (
              <div key={product.wishlist_id} className="relative border rounded-lg p-3">
                <div className="flex gap-3">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-24 h-24 object-cover rounded-md"
                    onClick={() => navigate(`/customer/product/${product.id}`)}
                  />
                  <div className="flex-1">
                    <h3 
                      className="font-medium cursor-pointer"
                      onClick={() => navigate(`/customer/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-700">₹{product.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    {!product.inStock && (
                      <p className="text-red-500 text-sm mt-1">Out of stock</p>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFromWishlist(product.wishlist_id, product.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Heart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
            <p className="mb-4">Save items you like by clicking the heart icon on products</p>
            <Button asChild>
              <a href="/customer/home">Browse Products</a>
            </Button>
          </div>
        )}
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerWishlist;
