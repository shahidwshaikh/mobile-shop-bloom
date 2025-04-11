import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

// Product type for Supabase data
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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    if (!id) return;
    
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
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleAddToWishlist = () => {
    if (!product) return;
    
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist`,
    });
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
        <p className="mt-2 text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        <p className="text-lg font-medium">Product not found</p>
        <Button variant="outline" className="mt-4" onClick={handleBack}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4 flex items-center">
        <button onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Product Details</h1>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-contain rounded-lg mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Error";
            }}
          />
          
          <h1 className="text-xl font-bold mb-1">{product.name}</h1>
          <p className="text-shop-purple text-xl font-bold mb-2">₹{product.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
          
          <div className="flex items-center mb-4">
            <span className={`px-2 py-1 rounded text-xs ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex items-center mb-6">
            <span className="mr-2">Quantity:</span>
            <button 
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="px-3 py-1 border rounded-l-md bg-gray-100"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-1 border-t border-b">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 border rounded-r-md bg-gray-100"
            >
              +
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAddToWishlist}
            >
              <Heart size={18} />
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Product Description</h2>
          <p className="text-gray-600">
            Experience cutting-edge technology with the {product.name}. This {product.category.toLowerCase()} offers a perfect blend of performance and design, making it an ideal choice for all your needs.
          </p>
        </div>
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default ProductDetail;
