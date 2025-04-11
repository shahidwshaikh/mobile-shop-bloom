
import { LayoutDashboard, Package, ShoppingBag, BarChart, MessageSquare, LogOut, Users, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      navigate("/role-select");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const switchToCustomer = () => {
    navigate("/customer/login");
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
      
      <Sheet>
        <SheetTrigger asChild>
          <button className={`nav-item flex flex-col items-center justify-center gap-1 flex-1 ${isActive("/support") ? "text-shop-purple" : "text-gray-500"}`}>
            <User size={24} />
            <span className="text-xs">Account</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Admin Options</SheetTitle>
            <SheetDescription>
              Manage your admin account or switch roles
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-2">
            <Link to="/admin/support">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Support
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={switchToCustomer}>
              <Users className="mr-2 h-4 w-4" />
              Switch to Customer
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminNavbar;
