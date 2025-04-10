
import { useState } from "react";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import ProductGrid from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  "all", "Smartphone", "Accessories", "Wearables", "Tablets"
];

const CustomerHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">Mobile Shop Bloom</h1>
        <p className="text-sm opacity-90">Find the best mobile products</p>
      </div>
      
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === "all" ? "All Products" : category}
            </Button>
          ))}
        </div>
        
        <Tabs defaultValue="featured" className="w-full mb-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New Arrivals</TabsTrigger>
            <TabsTrigger value="sale">On Sale</TabsTrigger>
          </TabsList>
          <TabsContent value="featured">
            <div className="py-2">
              <ProductGrid filterCategory={selectedCategory !== "all" ? selectedCategory : undefined} />
            </div>
          </TabsContent>
          <TabsContent value="new">
            <div className="py-2">
              <ProductGrid filterCategory={selectedCategory !== "all" ? selectedCategory : undefined} />
            </div>
          </TabsContent>
          <TabsContent value="sale">
            <div className="py-2">
              <ProductGrid filterCategory={selectedCategory !== "all" ? selectedCategory : undefined} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <CustomerNavbar />
    </div>
  );
};

export default CustomerHome;
