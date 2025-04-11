
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  product_id: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/customer/login");
        return;
      }
      
      fetchOrders();
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Fetch order items and product details for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
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
          
          const items = itemsData.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.products?.name || 'Product',
            product_image: item.products?.image || ''
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
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return "bg-green-500";
      case 'processing':
        return "bg-blue-500";
      case 'shipped':
        return "bg-yellow-500";
      case 'cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const goBack = () => {
    navigate(-1);
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
        <h1 className="text-lg font-medium">My Orders</h1>
        <div className="ml-auto w-10"></div>
      </div>
      
      <div className="pt-16 p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to place your first order</p>
            <Button onClick={() => navigate("/customer/home")}>
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.slice(-6)}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img 
                          src={item.product_image} 
                          alt={item.product_name}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium line-clamp-1">{item.product_name}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-shop-purple font-medium">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span className="text-shop-purple">₹{order.total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrders;
