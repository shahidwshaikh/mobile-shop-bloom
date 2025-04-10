
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the splash screen
    navigate("/splash");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-shop-purple">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Mobile Shop Bloom</h1>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
