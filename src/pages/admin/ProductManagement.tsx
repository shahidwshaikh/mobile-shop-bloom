
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

// Type definition for product
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
}

const categories = ["Smartphone", "Accessories", "Wearables", "Tablets", "Others"];

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "Smartphone",
    in_stock: true
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Failed to load products",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStock = async (id: string, currentStock: boolean) => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStock })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setProducts(products.map(product => 
        product.id === id ? { ...product, in_stock: !currentStock } : product
      ));
      
      toast({
        title: "Product updated",
        description: "Product stock status has been updated",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the product",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the product",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      ...product,
      price: product.price
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          price: parseFloat(editingProduct.price.toString()),
          image: editingProduct.image,
          category: editingProduct.category,
          in_stock: editingProduct.in_stock,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);
      
      if (error) {
        throw error;
      }
      
      setProducts(products.map(product => 
        product.id === editingProduct.id ? editingProduct : product
      ));
      
      setEditingProduct(null);
      
      toast({
        title: "Product updated",
        description: "Product details have been updated",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the product",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessing(true);
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
          in_stock: newProduct.in_stock
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setProducts([data[0], ...products]);
      }
      
      setNewProduct({
        name: "",
        price: "",
        image: "",
        category: "Smartphone",
        in_stock: true
      });
      
      toast({
        title: "Product added",
        description: "New product has been added successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Add failed",
        description: "There was an error adding the product",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const validateImageUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
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
              disabled={processing}
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
                <label className="text-sm font-medium">Product Name *</label>
                <Input 
                  value={newProduct.name} 
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input 
                  type="number" 
                  value={newProduct.price} 
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Enter price" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL *</label>
                <Input 
                  value={newProduct.image} 
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="Enter image URL" 
                />
                {newProduct.image && !validateImageUrl(newProduct.image) && (
                  <p className="text-xs text-red-500">Please enter a valid URL</p>
                )}
                {newProduct.image && validateImageUrl(newProduct.image) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                    <img 
                      src={newProduct.image} 
                      alt="Preview" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Error";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
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
                  checked={newProduct.in_stock} 
                  onCheckedChange={(checked) => setNewProduct({...newProduct, in_stock: checked})}
                />
                <label className="text-sm font-medium">In Stock</label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button 
                  onClick={handleAddProduct}
                  disabled={!newProduct.name || !newProduct.price || !newProduct.image || processing}
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Product
                </Button>
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
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 text-shop-purple animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Error";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
                      <p className="text-shop-purple font-bold">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={product.in_stock} 
                            onCheckedChange={() => handleToggleStock(product.id, product.in_stock)}
                            disabled={processing}
                          />
                          <span className="text-xs">
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                            disabled={processing}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={processing}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                  onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
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
                {editingProduct.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                    <img 
                      src={editingProduct.image} 
                      alt="Preview" 
                      className="w-full h-32 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Image+Error";
                      }}
                    />
                  </div>
                )}
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
                  checked={editingProduct.in_stock} 
                  onCheckedChange={(checked) => setEditingProduct({...editingProduct, in_stock: checked})}
                />
                <label className="text-sm font-medium">In Stock</label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button 
                  onClick={handleUpdateProduct}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Product
                </Button>
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
