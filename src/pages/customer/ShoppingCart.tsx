
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        // Instead of redirecting, allow the user to see the cart but require login for checkout
      } else {
        setIsAuthenticated(true);
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
    
    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [navigate]);
  
  useEffect(() => {
    // Save cart items to localStorage when they change
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const goBack = () => {
    navigate(-1);
  };
  
  const removeItem = (id: number | string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item removed from your cart",
      duration: 2000,
    });
  };
  
  const updateQuantity = (id: number | string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 5) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = subtotal > 0 ? 99 : 0;
    return subtotal + deliveryFee;
  };
  
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to complete your purchase",
        variant: "destructive",
      });
      navigate("/customer/login");
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create order
      const orderTotal = calculateTotal();
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: orderTotal,
          status: 'Processing'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Add order items - Fix the type mismatch by mapping each item properly
      // and ensuring product_id is always a string
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: String(item.id), // Convert product_id to string
        quantity: item.quantity,
        price: item.price
      }));
      
      // Insert each order item individually to avoid type mismatch with array insert
      for (const item of orderItems) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert(item);
          
        if (itemError) throw itemError;
      }
      
      // Clear cart
      setCartItems([]);
      localStorage.removeItem('cart');
      
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed",
        duration: 3000,
      });
      
      navigate("/customer/orders");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-lg font-medium">Shopping Cart</h1>
        <div className="ml-auto w-10"></div>
      </div>
      
      <div className="pt-16 p-4">
        {!isAuthenticated && cartItems.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <AlertCircle className="text-yellow-500 mr-2" size={18} />
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Login required</span> to place an order
            </p>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to your cart</p>
            <Button onClick={() => navigate("/customer/home")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 bg-white rounded-lg p-3 border">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{item.name}</h3>
                  <p className="text-shop-purple font-bold">₹{item.price.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 5}
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 h-8 w-8"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 bg-white rounded-lg p-4 border">
              <h3 className="font-medium mb-3">Order Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>₹99</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-shop-purple">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </div>
        )}
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default ShoppingCart;
