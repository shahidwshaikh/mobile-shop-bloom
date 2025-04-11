
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import Index from "@/pages/Index";
import SplashScreen from "@/components/SplashScreen";
import RoleSelection from "@/components/RoleSelection";
import CustomerAuth from "@/components/auth/CustomerAuth";
import AdminAuth from "@/components/auth/AdminAuth";
import CustomerHome from "@/pages/customer/CustomerHome";
import ProductDetail from "@/pages/customer/ProductDetail";
import ShoppingCart from "@/pages/customer/ShoppingCart";
import CustomerOrders from "@/pages/customer/CustomerOrders";
import SearchPage from "@/pages/customer/SearchPage";
import CustomerWishlist from "@/pages/customer/CustomerWishlist";
import CustomerProfile from "@/pages/customer/CustomerProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductManagement from "@/pages/admin/ProductManagement";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSupport from "@/pages/admin/AdminSupport";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Initial Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/role-select" element={<RoleSelection />} />
          
          {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerAuth />} />
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/product/:id" element={<ProductDetail />} />
          <Route path="/customer/cart" element={<ShoppingCart />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/search" element={<SearchPage />} />
          <Route path="/customer/wishlist" element={<CustomerWishlist />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          
          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
