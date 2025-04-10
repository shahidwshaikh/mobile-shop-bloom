
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigate("/role-select");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-shop-purple to-shop-darkPurple">
      <div className="text-center animate-fade-in">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white mb-4">
          <Phone className="h-10 w-10 text-shop-purple animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Mobile Shop Bloom</h1>
        <p className="text-shop-lightPurple">Empower your mobile business</p>
      </div>
    </div>
  );
};

export default SplashScreen;
