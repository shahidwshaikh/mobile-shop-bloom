
import { useEffect, useState } from "react";
import { BarChart as BarChartIcon, TrendingUp, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Order {
  id: string;
  user_id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
}

interface StatsItem {
  title: string;
  value: string;
  change: string;
  icon: JSX.Element;
  trend: "up" | "down";
}

interface SalesData {
  name: string;
  sales: number;
}

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [salesChartData, setSalesChartData] = useState<SalesData[]>([]);
  const [salesChartLoading, setSalesChartLoading] = useState(true);
  const [stats, setStats] = useState<StatsItem[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch total sales
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total');
        
        if (ordersError) throw ordersError;
        
        const totalSales = ordersData.reduce((sum, order) => sum + order.total, 0);
        
        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productsError) throw productsError;
        
        // Fetch new orders (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { count: newOrdersCount, error: newOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastWeek.toISOString());
        
        if (newOrdersError) throw newOrdersError;
        
        // Fetch customers count
        const { count: customersCount, error: customersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (customersError) throw customersError;
        
        setStats([
          {
            title: "Total Sales",
            value: `₹${totalSales.toLocaleString('en-IN')}`,
            change: "+12.5%", // In a real app, you would calculate this
            icon: <TrendingUp className="text-green-500" />,
            trend: "up"
          },
          {
            title: "Products",
            value: String(productsCount || 0),
            change: "+2", // In a real app, you would calculate this
            icon: <Package className="text-blue-500" />,
            trend: "up"
          },
          {
            title: "New Orders",
            value: String(newOrdersCount || 0),
            change: "+3", // In a real app, you would calculate this
            icon: <ShoppingBag className="text-purple-500" />,
            trend: "up"
          },
          {
            title: "Customers",
            value: String(customersCount || 0),
            change: "+5", // In a real app, you would calculate this
            icon: <Users className="text-orange-500" />,
            trend: "up"
          }
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error fetching dashboard statistics",
          description: "There was a problem loading the dashboard data.",
          variant: "destructive"
        });
      } finally {
        setStatsLoading(false);
      }
    };
    
    const fetchSalesChartData = async () => {
      try {
        setSalesChartLoading(true);
        
        // Get the current date
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        
        // Get first day of 6 months ago
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('orders')
          .select('created_at, total')
          .gte('created_at', sixMonthsAgo.toISOString());
        
        if (error) throw error;
        
        // Group sales by month
        const salesByMonth: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize all months with 0
        for (let i = 0; i < 6; i++) {
          const monthIndex = (sixMonthsAgo.getMonth() + i) % 12;
          salesByMonth[months[monthIndex]] = 0;
        }
        
        // Add sales data
        data.forEach(order => {
          const date = new Date(order.created_at);
          const month = months[date.getMonth()];
          salesByMonth[month] = (salesByMonth[month] || 0) + order.total;
        });
        
        // Convert to chart format
        const chartData = Object.entries(salesByMonth).map(([name, sales]) => ({
          name,
          sales: Number(sales.toFixed(2))
        }));
        
        setSalesChartData(chartData);
      } catch (error) {
        console.error("Error fetching sales chart data:", error);
        toast({
          title: "Error fetching sales data",
          description: "There was a problem loading the sales chart.",
          variant: "destructive"
        });
      } finally {
        setSalesChartLoading(false);
      }
    };
    
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true);
        
        // First fetch all orders with joined profile data
        const { data: ordersWithProfiles, error } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            status,
            total,
            created_at,
            profiles:profiles!inner(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        if (!ordersWithProfiles || ordersWithProfiles.length === 0) {
          setRecentOrders([]);
          setIsLoading(false);
          return;
        }
        
        // Transform the joined data into the expected format
        const formattedOrders = ordersWithProfiles.map(order => ({
          id: order.id,
          user_id: order.user_id,
          customer: order.profiles?.full_name || 'Unknown Customer',
          status: order.status,
          total: order.total,
          created_at: order.created_at
        }));
        
        setRecentOrders(formattedOrders);
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
    
    fetchStats();
    fetchSalesChartData();
    fetchRecentOrders();
    
    // Set up real-time subscriptions for orders
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
          fetchStats();
          fetchSalesChartData();
          fetchRecentOrders();
        }
      )
      .subscribe();
    
    // Set up real-time subscriptions for profiles
    const profilesSubscription = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchRecentOrders(); // Refresh orders when profiles change
        }
      )
      .subscribe();
    
    // Set up additional subscriptions for products
    const productsSubscription = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(productsSubscription);
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
          {statsLoading ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-8 rounded-full mb-2" />
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sales Overview</CardTitle>
            <CardDescription>Total sales of the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {salesChartLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Skeleton className="h-[180px] w-full" />
              </div>
            ) : salesChartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">No sales data available</p>
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
