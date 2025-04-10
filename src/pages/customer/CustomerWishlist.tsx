
import { useState } from "react";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import ProductCard, { Product } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

// Sample wishlist data (for demonstration)
const sampleWishlistProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 13 Pro Max",
    price: 119900,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=1000",
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
  }
];

const CustomerWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>(sampleWishlistProducts);

  const removeFromWishlist = (productId: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

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
              <div key={product.id} className="relative border rounded-lg p-3">
                <div className="flex gap-3">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-gray-700">₹{(product.price / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Add to Cart
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFromWishlist(product.id)}
                      >
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
