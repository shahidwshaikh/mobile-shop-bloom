import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2, ChevronLeft, AlertCircle, MapPin, Phone, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  pincode: z.string().min(6, { message: "Enter a valid 6-digit pincode" }),
});

const ShoppingCart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      pincode: "",
    },
  });
  
  const queryParams = new URLSearchParams(location.search);
  const paymentCanceled = queryParams.get('canceled') === 'true';
  
  useEffect(() => {
    if (paymentCanceled) {
      toast({
        title: "Order canceled",
        description: "Your order was canceled. Your cart items are still available.",
        variant: "destructive",
      });
    }
  }, [paymentCanceled, toast]);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          form.setValue('name', profileData.full_name || '');
          form.setValue('phone', profileData.phone || '');
        }
      }
    };
    
    checkAuth();
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [navigate, form]);
  
  useEffect(() => {
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
  
  const proceedToCustomerInfo = () => {
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
    
    setShowCustomerForm(true);
  };
  
  const handleSubmitOrder = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    
    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase.functions.invoke("create-payment", {
        method: "POST",
        body: JSON.stringify({ 
          items: cartItems,
          userId: userId,
          customerInfo: {
            name: values.name,
            phone: values.phone,
            address: values.address,
            pincode: values.pincode
          }
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (error) {
        console.error("Checkout error:", error);
        throw error;
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to create order");
      }
      
      localStorage.removeItem('cart');
      setCartItems([]);
      
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed.",
        duration: 5000,
      });
      
      navigate("/customer/orders?success=true");
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
        ) : showCustomerForm ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitOrder)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <User className="ml-2 h-5 w-5 text-gray-400" />
                            <Input placeholder="Enter your full name" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <Phone className="ml-2 h-5 w-5 text-gray-400" />
                            <Input placeholder="Enter your phone number" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="flex items-start border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <Home className="ml-2 mt-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                            <Textarea placeholder="Enter your full address" className="min-h-20 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <MapPin className="ml-2 h-5 w-5 text-gray-400" />
                            <Input placeholder="Enter 6-digit pincode" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span>₹99</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-shop-purple">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowCustomerForm(false)}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
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
              onClick={proceedToCustomerInfo}
              disabled={isProcessing}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default ShoppingCart;
