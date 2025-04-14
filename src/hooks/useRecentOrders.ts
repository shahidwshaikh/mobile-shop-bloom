
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Order {
  id: string;
  user_id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
}

export const useRecentOrders = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setIsLoading(true);
        
        // First fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            status,
            total,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ordersError) throw ordersError;
        
        if (!ordersData || ordersData.length === 0) {
          setRecentOrders([]);
          setIsLoading(false);
          return;
        }
        
        // Then fetch customer profiles for each order
        const formattedOrders = await Promise.all(
          ordersData.map(async (order) => {
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
              customer: profileData?.full_name || "No customer name",
              status: order.status,
              total: order.total,
              created_at: order.created_at
            };
          })
        );
        
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

    fetchRecentOrders();
    
    // Set up real-time subscriptions for orders
    const ordersSubscription = supabase
      .channel('public:recent-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchRecentOrders();
        }
      )
      .subscribe();
    
    // Set up real-time subscriptions for profiles
    const profilesSubscription = supabase
      .channel('public:recent-profiles')
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
    
    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(profilesSubscription);
    };
  }, [toast]);

  return { recentOrders, isLoading };
};
