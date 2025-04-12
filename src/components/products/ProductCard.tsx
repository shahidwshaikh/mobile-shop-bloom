
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if the product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const { data } = await supabase
        .rpc('get_wishlist_status', {
          p_product_id: product.id,
          p_user_id: session.session.user.id
        });
      
      if (data) {
        setIsFavorite(true);
      }
    };
    
    checkWishlistStatus();
  }, [product.id]);

  const handleNavigate = () => {
    navigate(`/customer/product/${product.id}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
    
    if (isFavorite) {
      // Remove from wishlist using raw SQL via RPC
      const { error } = await supabase
        .rpc('remove_from_wishlist', {
          p_product_id: product.id,
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
        description: `${product.name} removed from your wishlist`,
        duration: 2000,
      });
    } else {
      // Add to wishlist using raw SQL via RPC
      const { error } = await supabase
        .rpc('add_to_wishlist', {
          p_product_id: product.id,
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
        description: `${product.name} added to your wishlist`,
        duration: 2000,
      });
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
      onClick={handleNavigate}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full"
          onClick={toggleFavorite}
        >
          <Heart 
            size={20} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <Badge variant="outline" className="mb-2">{product.category}</Badge>
        <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <p className="font-bold text-shop-purple">₹{product.price.toLocaleString()}</p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
