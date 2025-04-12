
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopOwnerName, setShopOwnerName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/admin/dashboard");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleToggleView = () => {
    setIsSignUp(!isSignUp);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignUp && !shopOwnerName)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: shopOwnerName,
              is_admin: true
            },
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });
        
        // Switch to login view after signup
        setIsSignUp(false);
        
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back",
          description: "You have been logged in successfully",
        });
        
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: isSignUp ? "Signup failed" : "Login failed",
        description: error.message || "There was an error processing your request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-shop-purple">
            Admin {isSignUp ? "Sign Up" : "Login"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create a new admin account to manage your store" 
              : "Sign in to access your admin dashboard"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="shopOwnerName" className="text-sm font-medium">Shop Owner Name</label>
                <Input 
                  id="shopOwnerName"
                  type="text" 
                  placeholder="Your Name"
                  value={shopOwnerName}
                  onChange={(e) => setShopOwnerName(e.target.value)}
                  disabled={loading}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email"
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleToggleView}
              className="text-sm text-gray-600 hover:text-shop-purple"
              disabled={loading}
            >
              {isSignUp 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
