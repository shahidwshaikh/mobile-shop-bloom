
import { useNavigate } from "react-router-dom";
import { Users, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Mobile Shop Bloom</h1>
      <p className="text-muted-foreground text-center mb-10">Please select your role to continue</p>
      
      <div className="grid gap-6 w-full max-w-sm">
        <Button 
          onClick={() => navigate("/customer/login")}
          className="h-24 bg-shop-purple hover:bg-shop-darkPurple flex flex-col gap-2 p-4"
          size="lg"
        >
          <Users className="h-8 w-8" />
          <span className="text-lg font-medium">I'm a Customer</span>
        </Button>
        
        <Button 
          onClick={() => navigate("/admin/login")}
          className="h-24 bg-shop-black hover:bg-gray-800 flex flex-col gap-2 p-4"
          size="lg"
        >
          <Store className="h-8 w-8" />
          <span className="text-lg font-medium">I'm a Shop Owner</span>
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;
