
import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AdminNavbar from "@/components/navigation/AdminNavbar";

// Sample product data
const initialProducts = [
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
  }
];

const categories = ["Smartphone", "Accessories", "Wearables", "Tablets", "Others"];

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "Smartphone",
    inStock: true
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStock = (id: number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, inStock: !product.inStock } : product
    ));
    
    toast({
      title: "Product updated",
      description: "Product stock status has been updated",
      duration: 2000,
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    
    toast({
      title: "Product deleted",
      description: "Product has been deleted successfully",
      duration: 2000,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      price: product.price.toString()
    });
  };

  const handleUpdateProduct = () => {
    setProducts(products.map(product => 
      product.id === editingProduct.id 
        ? { 
            ...editingProduct, 
            price: parseFloat(editingProduct.price)
          } 
        : product
    ));
    
    setEditingProduct(null);
    
    toast({
      title: "Product updated",
      description: "Product details have been updated",
      duration: 2000,
    });
  };

  const handleAddProduct = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    
    setProducts([
      ...products,
      {
        id: newId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        image: newProduct.image,
        category: newProduct.category,
        inStock: newProduct.inStock
      }
    ]);
    
    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "Smartphone",
      inStock: true
    });
    
    toast({
      title: "Product added",
      description: "New product has been added successfully",
      duration: 2000,
    });
  };

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Manage Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="ml-auto"
            >
              <Plus size={16} className="mr-1" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input 
                  value={newProduct.name} 
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input 
                  type="number" 
                  value={newProduct.price} 
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Enter price" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input 
                  value={newProduct.image} 
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="Enter image URL" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newProduct.inStock} 
                  onCheckedChange={(checked) => setNewProduct({...newProduct, inStock: checked})}
                />
                <label className="text-sm font-medium">In Stock</label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="pt-16 p-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="mb-4"
        />
        
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
                      <p className="text-shop-purple font-bold">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={product.inStock} 
                            onCheckedChange={() => handleToggleStock(product.id)}
                          />
                          <span className="text-xs">
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Edit Product Modal */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Enter product name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input 
                  type="number" 
                  value={editingProduct.price} 
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                  placeholder="Enter price" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input 
                  value={editingProduct.image} 
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="Enter image URL" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={editingProduct.category}
                  onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editingProduct.inStock} 
                  onCheckedChange={(checked) => setEditingProduct({...editingProduct, inStock: checked})}
                />
                <label className="text-sm font-medium">In Stock</label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleUpdateProduct}>Update Product</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <AdminNavbar />
    </div>
  );
};

export default ProductManagement;
