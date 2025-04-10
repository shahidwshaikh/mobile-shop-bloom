
import { useEffect, useState } from "react";
import ProductCard, { Product } from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample product data
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 13 Pro Max",
    price: 119900,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 2,
    name: "Samsung Galaxy S21",
    price: 69999,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 3,
    name: "OnePlus 9 Pro",
    price: 64999,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: false
  },
  {
    id: 4,
    name: "Xiaomi Mi 11",
    price: 49999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: 5,
    name: "Apple AirPods Pro",
    price: 24900,
    image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&q=80&w=1000",
    category: "Accessories",
    inStock: true
  },
  {
    id: 6,
    name: "Samsung Galaxy Watch 4",
    price: 26999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
    category: "Wearables",
    inStock: true
  }
];

interface ProductGridProps {
  filterCategory?: string;
}

const ProductGrid = ({ filterCategory }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    // Simulating API fetch
    setProducts(sampleProducts);
  }, []);

  useEffect(() => {
    let result = [...products];
    
    // Apply category filter if provided
    if (filterCategory && filterCategory !== "all") {
      result = result.filter(product => product.category === filterCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredProducts(result);
  }, [products, filterCategory, searchQuery, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1"
        />
        <Select defaultValue={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
