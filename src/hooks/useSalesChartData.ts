
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SalesData {
  name: string;
  sales: number;
}

export const useSalesChartData = () => {
  const [salesChartData, setSalesChartData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSalesChartData = async () => {
      try {
        setIsLoading(true);
        
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
        setIsLoading(false);
      }
    };

    fetchSalesChartData();

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('public:orders-sales')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchSalesChartData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);

  return { salesChartData, isLoading };
};
