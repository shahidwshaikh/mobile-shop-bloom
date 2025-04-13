
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Package, ShoppingBag, Users } from "lucide-react";

export interface StatsItem {
  title: string;
  value: string;
  change: string;
  iconType: "sales" | "products" | "orders" | "customers";
  trend: "up" | "down";
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<StatsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
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
            iconType: "sales",
            trend: "up"
          },
          {
            title: "Products",
            value: String(productsCount || 0),
            change: "+2", // In a real app, you would calculate this
            iconType: "products",
            trend: "up"
          },
          {
            title: "New Orders",
            value: String(newOrdersCount || 0),
            change: "+3", // In a real app, you would calculate this
            iconType: "orders",
            trend: "up"
          },
          {
            title: "Customers",
            value: String(customersCount || 0),
            change: "+5", // In a real app, you would calculate this
            iconType: "customers",
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
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscriptions for products
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
          fetchStats();
        }
      )
      .subscribe();

    // Set up real-time subscriptions for orders
    const ordersSubscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(ordersSubscription);
    };
  }, [toast]);

  return { stats, isLoading };
};
