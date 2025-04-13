
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import AdminNavbar from "@/components/navigation/AdminNavbar";
import { OrderListItem } from "@/components/admin/OrderListItem";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { useOrdersManagement } from "@/hooks/useOrdersManagement";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminOrders = () => {
  const navigate = useNavigate();
  const {
    orders,
    loading,
    searchQuery,
    statusFilter,
    statusOptions,
    handleSearch,
    handleStatusChange,
    updateOrderStatus
  } = useOrdersManagement();
  
  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Manage Orders</h1>
      </div>
      
      <div className="pt-16 p-4">
        <OrderFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusChange}
          statusOptions={statusOptions}
        />
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <OrderListItem
                key={order.id}
                id={order.id}
                customer={order.customer}
                status={order.status}
                total={order.total}
                created_at={order.created_at}
                items={order.items}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          )}
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminOrders;
