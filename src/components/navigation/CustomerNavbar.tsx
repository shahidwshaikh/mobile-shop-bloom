
import { Home, Search, ShoppingCart, User, Heart, Store } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const CustomerNavbar = () => {
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
      });
      navigate("/role-select");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const switchToAdmin = () => {
    navigate("/admin/login");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between">
      <Link 
        to="/customer/home" 
        className={`nav-item ${isActive("/home") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <Home size={24} />
        <span>Home</span>
      </Link>
      
      <Link 
        to="/customer/search" 
        className={`nav-item ${isActive("/search") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <Search size={24} />
        <span>Search</span>
      </Link>
      
      <Link 
        to="/customer/wishlist" 
        className={`nav-item ${isActive("/wishlist") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <Heart size={24} />
        <span>Wishlist</span>
      </Link>
      
      <Link 
        to="/customer/cart" 
        className={`nav-item ${isActive("/cart") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <ShoppingCart size={24} />
        <span>Cart</span>
      </Link>
      
      <Sheet>
        <SheetTrigger asChild>
          <button className={`nav-item ${isActive("/profile") ? "nav-item-active" : "nav-item-inactive"}`}>
            <User size={24} />
            <span>Profile</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Account Options</SheetTitle>
            <SheetDescription>
              Manage your account or switch roles
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-2">
            <Link to="/customer/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Button>
            </Link>
            <Link to="/customer/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                My Orders
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={switchToAdmin}>
              <Store className="mr-2 h-4 w-4" />
              Switch to Admin
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CustomerNavbar;
