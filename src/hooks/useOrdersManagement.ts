
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  user_id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
  address: string;
  pincode: string;
  items: number;
  phone?: string;
}

export const useOrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  
  const statusOptions = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return false;
      }
      return true;
    };
    
    const initializeOrders = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;
      
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
    
    initializeOrders();
  }, []);
  
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
          created_at,
          address,
          pincode
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
          
          // Get customer profile - using maybeSingle instead of single to avoid errors
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', order.user_id)
            .maybeSingle();
            
          return {
            id: order.id,
            user_id: order.user_id,
            customer: profileData?.full_name || 'Unknown Customer',
            phone: profileData?.phone || 'No phone provided',
            status: order.status,
            total: order.total,
            created_at: order.created_at,
            address: order.address || 'No address provided',
            pincode: order.pincode || 'No pincode provided',
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
  
  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone && order.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.address && order.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.pincode && order.pincode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return {
    orders: filteredOrders,
    loading,
    searchQuery,
    statusFilter,
    statusOptions,
    handleSearch,
    handleStatusChange,
    updateOrderStatus
  };
};
