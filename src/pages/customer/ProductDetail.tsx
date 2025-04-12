
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ChevronLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setProduct(data);
        
        // Check if product is in wishlist using RPC function
        const { data: session } = await supabase.auth.getSession();
        if (session.session && id) {
          const { data: wishlistData } = await supabase
            .rpc('get_wishlist_status', {
              p_product_id: id,
              p_user_id: session.session.user.id
            });
          
          setIsFavorite(!!wishlistData);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const toggleFavorite = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    const userId = session.session.user.id;
    
    if (!id) return;
    
    if (isFavorite) {
      // Remove from wishlist using RPC
      const { error } = await supabase
        .rpc('remove_from_wishlist', {
          p_product_id: id,
          p_user_id: userId
        });
      
      if (error) {
        console.error("Error removing from wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove from wishlist",
          variant: "destructive",
        });
        return;
      }
      
      setIsFavorite(false);
      toast({
        title: "Removed from wishlist",
        description: `${product?.name} removed from your wishlist`,
        duration: 2000,
      });
    } else {
      // Add to wishlist using RPC
      const { error } = await supabase
        .rpc('add_to_wishlist', {
          p_product_id: id,
          p_user_id: userId
        });
      
      if (error) {
        console.error("Error adding to wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to add to wishlist",
          variant: "destructive",
        });
        return;
      }
      
      setIsFavorite(true);
      toast({
        title: "Added to wishlist",
        description: `${product?.name} added to your wishlist`,
        duration: 2000,
      });
    }
  };
  
  const addToCart = () => {
    if (!product) return;
    
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
      <div className="min-h-screen pb-16">
        <div className="p-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
        </div>
        <CustomerNavbar />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen pb-16">
        <div className="p-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="mt-10 text-center">
            <h2 className="text-xl font-semibold">Product Not Found</h2>
            <p className="mt-2 text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-4" onClick={() => navigate('/customer/home')}>
              Back to Shopping
            </Button>
          </div>
        </div>
        <CustomerNavbar />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16">
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 pb-8">
        <div className="relative aspect-square mb-4">
          <img 
            src={product?.image} 
            alt={product?.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Not+Found";
            }}
          />
          <button 
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
            onClick={toggleFavorite}
          >
            <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} />
          </button>
          
          {product && !product.in_stock && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
              <Badge variant="destructive" className="text-base px-4 py-2">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">{product.category}</Badge>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl font-bold text-shop-purple mt-1">₹{product.price.toLocaleString()}</p>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="font-medium mb-2">Product Description</h2>
            <p className="text-gray-600 text-sm">
              Experience the power and elegance of the {product.name}. 
              This premium {product.category.toLowerCase()} offers cutting-edge technology 
              and sleek design to enhance your digital lifestyle.
            </p>
          </div>
          
          <Card className="bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Availability</p>
                <p className={`text-sm ${product.in_stock ? "text-green-600" : "text-red-600"}`}>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm">{product.category}</p>
              </div>
            </div>
          </Card>
          
          <Button 
            className="w-full py-6" 
            onClick={addToCart}
            disabled={!product.in_stock}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default ProductDetail;
