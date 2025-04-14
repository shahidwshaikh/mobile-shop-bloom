import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  product_id: string;
  order_id: string;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const CustomerOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for success parameter in URL
  const queryParams = new URLSearchParams(location.search);
  const orderSuccess = queryParams.get('success') === 'true';
  
  useEffect(() => {
    if (orderSuccess) {
      toast({
        title: "Order placed successfully",
        description: "Your order is being processed.",
        duration: 5000,
      });
      // Remove the success param to prevent showing the toast on refresh
      navigate('/customer/orders', { replace: true });
      
      // Clear the cart after successful order
      localStorage.removeItem('cart');
    }
  }, [orderSuccess, toast, navigate]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/customer/login");
          return;
        }
        
        // Fetch orders for this user
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        // Fetch order items and product details for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                id, 
                order_id, 
                product_id, 
                quantity, 
                price, 
                products (
                  name, 
                  image
                )
              `)
              .eq('order_id', order.id);
              
            if (itemsError) throw itemsError;
            
            // Format order items with product details
            const items = itemsData.map(item => ({
              id: item.id,
              product_id: item.product_id,
              order_id: item.order_id,
              quantity: item.quantity,
              price: item.price,
              product_name: item.products?.name || 'Product Unavailable',
              product_image: item.products?.image || '/placeholder.svg'
            }));
            
            return { 
              ...order, 
              items 
            };
          })
        );
        
        setOrders(ordersWithItems);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error loading orders",
          description: "There was a problem fetching your orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate, toast]);
  
  const goBack = () => {
    navigate("/customer/home");
  };

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-auto" 
          onClick={() => navigate("/customer/home")}
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-medium">My Orders</h1>
        <div className="ml-auto w-10"></div>
      </div>
      
      <div className="pt-16 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-shop-purple" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to place your first order</p>
            <Button onClick={() => navigate("/customer/home")}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orderSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={18} />
                <p className="text-sm text-green-700">
                  <span className="font-medium">Order successful!</span> Your order is being processed.
                </p>
              </div>
            )}
            
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                        <img 
                          src={item.product_image} 
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium line-clamp-1">
                          {item.product_name}
                        </h3>
                        <div className="flex text-xs text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span>₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-shop-purple">₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrders;
