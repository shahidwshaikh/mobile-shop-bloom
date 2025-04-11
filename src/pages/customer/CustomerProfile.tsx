
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ShoppingBag, Heart, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { supabase } from "@/integrations/supabase/client";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/customer/login");
        return;
      }
      
      try {
        setLoading(true);
        
        // Set the user email
        setUserEmail(session.user.email);
        
        // Fetch the user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/customer/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: "My Orders", action: () => navigate("/customer/orders") },
    { icon: <Heart size={20} />, label: "My Wishlist", action: () => navigate("/customer/wishlist") },
    { icon: <MapPin size={20} />, label: "Shipping Addresses", action: () => {} },
    { icon: <Settings size={20} />, label: "Account Settings", action: () => {} },
  ];

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">My Profile</h1>
      </div>
      
      <div className="pt-16 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-shop-purple border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <User size={32} className="text-gray-500" />
                </div>
                <div>
                  <h2 className="font-medium text-lg">{profile?.full_name || "User"}</h2>
                  <p className="text-gray-500 text-sm">{profile?.phone || "No phone number"}</p>
                  <p className="text-gray-500 text-sm">{userEmail || "No email"}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start py-6 px-4 bg-white border rounded-lg"
                  onClick={item.action}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-100 mr-4">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start py-6 px-4 bg-white border rounded-lg text-red-500"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 mr-4">
                    <LogOut size={20} className="text-red-500" />
                  </div>
                  <span>Logout</span>
                </div>
              </Button>
            </div>
          </>
        )}
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default CustomerProfile;
