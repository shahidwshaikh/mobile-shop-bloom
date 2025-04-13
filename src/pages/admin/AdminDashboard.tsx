
import AdminNavbar from "@/components/navigation/AdminNavbar";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SalesChart } from "@/components/admin/SalesChart";
import { RecentOrdersList } from "@/components/admin/RecentOrdersList";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useSalesChartData } from "@/hooks/useSalesChartData";
import { useRecentOrders } from "@/hooks/useRecentOrders";

const AdminDashboard = () => {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { salesChartData, isLoading: salesChartLoading } = useSalesChartData();
  const { recentOrders, isLoading: recentOrdersLoading } = useRecentOrders();

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">Shop Dashboard</h1>
        <p className="text-sm opacity-90">Welcome back, Shop Owner</p>
      </div>
      
      <div className="p-4 space-y-6">
        <StatsGrid stats={stats} isLoading={statsLoading} />
        <SalesChart data={salesChartData} isLoading={salesChartLoading} />
        <RecentOrdersList orders={recentOrders} isLoading={recentOrdersLoading} />
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminDashboard;
