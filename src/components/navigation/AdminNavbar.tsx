
import { LayoutDashboard, Package, ShoppingBag, BarChart, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between">
      <Link 
        to="/admin/dashboard" 
        className={`nav-item ${isActive("/dashboard") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <LayoutDashboard size={24} />
        <span>Dashboard</span>
      </Link>
      
      <Link 
        to="/admin/products" 
        className={`nav-item ${isActive("/products") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <Package size={24} />
        <span>Products</span>
      </Link>
      
      <Link 
        to="/admin/orders" 
        className={`nav-item ${isActive("/orders") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <ShoppingBag size={24} />
        <span>Orders</span>
      </Link>
      
      <Link 
        to="/admin/analytics" 
        className={`nav-item ${isActive("/analytics") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <BarChart size={24} />
        <span>Analytics</span>
      </Link>
      
      <Link 
        to="/admin/support" 
        className={`nav-item ${isActive("/support") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <MessageSquare size={24} />
        <span>Support</span>
      </Link>
    </div>
  );
};

export default AdminNavbar;
