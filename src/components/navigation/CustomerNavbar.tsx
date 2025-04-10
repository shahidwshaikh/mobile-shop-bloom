
import { Home, Search, ShoppingCart, User, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const CustomerNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
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
      
      <Link 
        to="/customer/profile" 
        className={`nav-item ${isActive("/profile") ? "nav-item-active" : "nav-item-inactive"}`}
      >
        <User size={24} />
        <span>Profile</span>
      </Link>
    </div>
  );
};

export default CustomerNavbar;
