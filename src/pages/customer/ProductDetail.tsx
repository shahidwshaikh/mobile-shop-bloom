
import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { Product } from "@/components/products/ProductCard";

// Sample product data
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 13 Pro Max",
    price: 119900,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 2,
    name: "Samsung Galaxy S21",
    price: 69999,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 3,
    name: "OnePlus 9 Pro",
    price: 64999,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: false
  },
  {
    id: 4,
    name: "Xiaomi Mi 11",
    price: 49999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 5,
    name: "Apple AirPods Pro",
    price: 24900,
    image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&q=80&w=1000",
    category: "Accessories",
    inStock: true
  },
  {
    id: 6,
    name: "Samsung Galaxy Watch 4",
    price: 26999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
    category: "Wearables",
    inStock: true
  }
];

// Product specifications based on product ID
const productSpecs: Record<number, string[]> = {
  1: [
    "6.7-inch Super Retina XDR display",
    "A15 Bionic chip",
    "Pro camera system: 12MP",
    "5G connectivity",
    "All-day battery life"
  ],
  2: [
    "6.2-inch Dynamic AMOLED 2X display",
    "Exynos 2100 / Snapdragon 888",
    "Triple camera setup: 12MP main",
    "5G connectivity",
    "4000mAh battery"
  ],
  3: [
    "6.7-inch Fluid AMOLED display",
    "Snapdragon 888 processor",
    "Hasselblad Quad camera: 48MP main",
    "5G connectivity",
    "4500mAh battery with Warp Charge"
  ],
  4: [
    "6.81-inch AMOLED display",
    "Snapdragon 888 processor",
    "Triple camera: 108MP main",
    "5G connectivity",
    "4600mAh battery"
  ],
  5: [
    "Active Noise Cancellation",
    "Transparency mode",
    "Adaptive EQ",
    "Spatial audio",
    "Water and sweat resistant"
  ],
  6: [
    "1.4-inch Super AMOLED display",
    "Exynos W920 chipset",
    "Health monitoring features",
    "Wear OS powered by Samsung",
    "Battery life up to 40 hours"
  ]
};

// Product descriptions based on product ID
const productDescriptions: Record<number, string> = {
  1: "The iPhone 13 Pro Max features a 6.7-inch Super Retina XDR display with ProMotion, A15 Bionic chip, Pro camera system with 12MP cameras, 5G connectivity, and all-day battery life.",
  2: "Experience epic on Galaxy S21 5G with a cinema-like viewing experience, all-day battery, and a powerful processor. Create, share, and experience more of what you love.",
  3: "The OnePlus 9 Pro redefines smartphone photography with Hasselblad Camera for Mobile. It features a powerful Snapdragon 888 processor, silky-smooth 120Hz display, and 65W Warp Charge.",
  4: "The Xiaomi Mi 11 comes with a professional grade triple camera array, Qualcomm Snapdragon 888 processor, stunning 6.81-inch AMOLED display, and 55W fast charging support.",
  5: "AirPods Pro feature Active Noise Cancellation, Transparency mode, sweat and water resistance, and a customizable fit for all-day comfort.",
  6: "The Galaxy Watch4 is designed to empower you with holistic health tracking and insight. It combines advanced sleep analysis, fitness metrics, and Samsung BioActive Sensor."
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Find the product by ID from our sample data
    // In a real app, this would be a fetch call to an API
    const productId = parseInt(id || '0');
    const foundProduct = sampleProducts.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
    }
    
    setLoading(false);
  }, [id]);
  
  const goBack = () => {
    navigate(-1);
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: product ? `${product.name} ${isFavorite ? "removed from" : "added to"} your wishlist` : "",
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
    if (!product) return;
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={goBack}>Go Back</Button>
        <CustomerNavbar />
      </div>
    );
  }

  const productId = parseInt(id || '0');
  const specs = productSpecs[productId] || [];
  const description = productDescriptions[productId] || product.name;

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
            <p className="text-gray-600">{description}</p>
          </div>
          
          <div>
            <h2 className="font-medium mb-2">Specifications</h2>
            <ul className="list-disc pl-5 text-gray-600">
              {specs.map((spec, index) => (
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
              disabled={!product.inStock}
            >
              <ShoppingCart size={18} className="mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
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
