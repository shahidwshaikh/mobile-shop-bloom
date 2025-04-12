
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import ProductCard, { Product } from "@/components/products/ProductCard";

// Sample product data with proper types (string IDs instead of numbers)
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 13 Pro Max",
    price: 119900,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: "2",
    name: "Samsung Galaxy S21",
    price: 69999,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: "3",
    name: "OnePlus 9 Pro",
    price: 64999,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: false
  },
  {
    id: "4",
    name: "Xiaomi Mi 11",
    price: 49999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1000",
    category: "Smartphone",
    inStock: true
  },
  {
    id: "5",
    name: "Apple AirPods Pro",
    price: 24900,
    image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&q=80&w=1000",
    category: "Accessories",
    inStock: true
  },
  {
    id: "6",
    name: "Samsung Galaxy Watch 4",
    price: 26999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
    category: "Wearables",
    inStock: true
  }
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

    const filtered = sampleProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">Search Products</h1>
        <p className="text-sm opacity-90">Find what you're looking for</p>
      </div>

      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <button 
            type="submit" 
            className="bg-shop-purple text-white p-2 rounded-md"
          >
            <SearchIcon size={20} />
          </button>
        </form>

        {hasSearched && (
          <div>
            <h2 className="text-lg font-medium mb-4">
              {searchResults.length === 0 
                ? "No products found" 
                : `Found ${searchResults.length} products`}
            </h2>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {!hasSearched && (
          <div className="text-center py-10 text-gray-500">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Search for products by name or category</p>
          </div>
        )}
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default SearchPage;
