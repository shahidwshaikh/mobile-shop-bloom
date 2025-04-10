
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Heart, 
  Share, 
  ShoppingCart, 
  Truck, 
  Shield, 
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";

// Sample product data (in a real app, you'd fetch this from an API)
const product = {
  id: 1,
  name: "iPhone 13 Pro Max",
  price: 119900,
  description: "The iPhone 13 Pro Max features a 6.7-inch Super Retina XDR display with ProMotion, A15 Bionic chip, Pro camera system with 12MP cameras, 5G connectivity, and all-day battery life.",
  image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=1000",
  category: "Smartphone",
  inStock: true,
  specs: [
    "6.7-inch Super Retina XDR display",
    "A15 Bionic chip",
    "Pro camera system: 12MP",
    "5G connectivity",
    "All-day battery life"
  ]
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const goBack = () => {
    navigate(-1);
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} ${isFavorite ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };
  
  const increaseQuantity = () => {
    if (quantity < 5) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const addToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 2000,
    });
  };
  
  const shareProduct = () => {
    // In a real app, use the Web Share API
    toast({
      title: "Share product",
      description: "Sharing functionality would open here",
      duration: 2000,
    });
  };
  
  const contactShop = () => {
    toast({
      title: "Contact shop",
      description: "Chat with shop functionality would open here",
      duration: 2000,
    });
  };

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-auto" 
          onClick={goBack}
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-medium">Product Details</h1>
        <div className="ml-auto flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFavorite}
          >
            <Heart 
              size={20} 
              className={isFavorite ? "fill-red-500 text-red-500" : ""}
            />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={shareProduct}
          >
            <Share size={20} />
          </Button>
        </div>
      </div>
      
      <div className="pt-16 pb-4">
        <div className="aspect-square bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold text-shop-purple mt-1">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="font-medium mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          <div>
            <h2 className="font-medium mb-2">Specifications</h2>
            <ul className="list-disc pl-5 text-gray-600">
              {product.specs.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
          </div>
          
          <Card className="bg-gray-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Truck size={20} className="text-shop-purple" />
              <div>
                <h3 className="font-medium">Fast Delivery</h3>
                <p className="text-xs text-gray-500">Delivery in 3-5 business days</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield size={20} className="text-shop-purple" />
              <div>
                <h3 className="font-medium">1 Year Warranty</h3>
                <p className="text-xs text-gray-500">Official warranty from manufacturer</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decreaseQuantity} 
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={increaseQuantity} 
                disabled={quantity >= 5}
              >
                +
              </Button>
            </div>
            
            <Button 
              className="flex-1" 
              onClick={addToCart}
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={contactShop}
          >
            <MessageCircle size={18} className="mr-2" />
            Contact Shop
          </Button>
        </div>
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default ProductDetail;
