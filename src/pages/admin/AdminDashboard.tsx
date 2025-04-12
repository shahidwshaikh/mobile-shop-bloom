import { useEffect, useState } from "react";
import { BarChart, TrendingUp, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  created_at: string;
}

interface StatsItem {
  title: string;
  value: string;
  change: string;
  icon: JSX.Element;
  trend: "up" | "down";
}

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const stats: StatsItem[] = [
    {
      title: "Total Sales",
      value: "₹45,231",
      change: "+12.5%",
      icon: <TrendingUp className="text-green-500" />,
      trend: "up"
    },
    {
      title: "Products",
      value: "24",
      change: "+2",
      icon: <Package className="text-blue-500" />,
      trend: "up"
    },
    {
      title: "New Orders",
      value: "12",
      change: "+3",
      icon: <ShoppingBag className="text-purple-500" />,
      trend: "up"
    },
    {
      title: "Customers",
      value: "42",
      change: "+5",
      icon: <Users className="text-orange-500" />,
      trend: "up"
    }
  ];
  
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true);
        
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ordersError) throw ordersError;
        
        if (!ordersData || ordersData.length === 0) {
          setRecentOrders([]);
          setIsLoading(false);
          return;
        }
        
        const ordersWithCustomers = await Promise.all(
          ordersData.map(async (order) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', order.user_id)
              .single();
            
            return {
              id: order.id,
              customer: profileData?.full_name || 'Unknown Customer',
              total: order.total,
              status: order.status,
              created_at: order.created_at
            };
          })
        );
        
        setRecentOrders(ordersWithCustomers);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error fetching orders",
          description: "There was a problem loading the recent orders.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentOrders();
    
    const subscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change received:', payload);
          fetchRecentOrders();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);
  
  const formatOrderId = (id: string) => {
    return id ? 'ORD-' + id.slice(-3) : 'Unknown';
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">Shop Dashboard</h1>
        <p className="text-sm opacity-90">Welcome back, Shop Owner</p>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="p-2 rounded-full bg-gray-100 mb-2">
                  {stat.icon}
                </div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <h3 className="text-lg font-bold">{stat.value}</h3>
                <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sales Overview</CardTitle>
            <CardDescription>Total sales of the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <BarChart size={180} className="text-gray-300" />
              <p className="absolute text-gray-500 text-sm">Sales chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex justify-between items-center p-3 border rounded-md animate-pulse">
                    <div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{formatOrderId(order.id)}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                      <p className={`text-xs ${
                        order.status === "Delivered" 
                          ? "text-green-500" 
                          : order.status === "Processing" 
                            ? "text-orange-500" 
                            : order.status === "Shipped"
                              ? "text-blue-500"
                              : "text-red-500"
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminDashboard;
