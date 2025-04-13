
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  user_id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
  items: number;
}

const statusOptions = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      
      // Fetch orders
      fetchOrders();
      
      // Set up subscription for real-time updates
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('Order change received:', payload);
            fetchOrders();
          }
        )
        .subscribe();
      
      // Set up subscription for profile changes
      const profilesSubscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('Profile change received:', payload);
            fetchOrders();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
        supabase.removeChannel(profilesSubscription);
      };
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          total,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Get order items count and customer details for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          // Get order items count
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id);
          
          // Get customer profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', order.user_id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
          
          return {
            id: order.id,
            user_id: order.user_id,
            customer: profileData?.full_name || 'Unknown Customer',
            status: order.status,
            total: order.total,
            created_at: order.created_at,
            items: count || 0
          };
        })
      );
      
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-yellow-500";
      case "Cancelled":
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
  
  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Manage Orders</h1>
      </div>
      
      <div className="pt-16 p-4">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">#{order.id.slice(-6)}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-shop-purple">₹{order.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <span>View Details</span>
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminOrders;
