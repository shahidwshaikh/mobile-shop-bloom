
import { LayoutDashboard, Package, ShoppingBag, BarChart, MessageSquare, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AdminNavbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
        duration: 3000,
      });
      // Navigate to login page after logout
      window.location.href = "/admin/login";
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between">
      <Link 
        to="/admin/dashboard" 
        className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/dashboard") ? "text-shop-purple" : "text-gray-500"}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-xs">Dashboard</span>
      </Link>
      
      <Link 
        to="/admin/products" 
        className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/products") ? "text-shop-purple" : "text-gray-500"}`}
      >
        <Package size={24} />
        <span className="text-xs">Products</span>
      </Link>
      
      <Link 
        to="/admin/orders" 
        className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/orders") ? "text-shop-purple" : "text-gray-500"}`}
      >
        <ShoppingBag size={24} />
        <span className="text-xs">Orders</span>
      </Link>
      
      <Link 
        to="/admin/analytics" 
        className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/analytics") ? "text-shop-purple" : "text-gray-500"}`}
      >
        <BarChart size={24} />
        <span className="text-xs">Analytics</span>
      </Link>
      
      <Link 
        to="/admin/support" 
        className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/support") ? "text-shop-purple" : "text-gray-500"}`}
      >
        <MessageSquare size={24} />
        <span className="text-xs">Support</span>
      </Link>
      
      <button 
        onClick={handleLogout}
        className="nav-item flex flex-col items-center justify-center gap-1 flex-1 text-gray-500"
      >
        <LogOut size={24} />
        <span className="text-xs">Logout</span>
      </button>
    </div>
  );
};

export default AdminNavbar;
