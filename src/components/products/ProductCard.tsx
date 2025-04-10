
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleNavigate = () => {
    navigate(`/customer/product/${product.id}`);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} ${isFavorite ? "removed from" : "added to"} your wishlist`,
      duration: 2000,
    });
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
      onClick={handleNavigate}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full"
          onClick={toggleFavorite}
        >
          <Heart 
            size={20} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <Badge variant="outline" className="mb-2">{product.category}</Badge>
        <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <p className="font-bold text-shop-purple">₹{product.price.toLocaleString()}</p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
