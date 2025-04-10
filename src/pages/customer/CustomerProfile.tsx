
import { useState } from "react";
import CustomerNavbar from "@/components/navigation/CustomerNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogOut, ShoppingBag, CreditCard, Settings } from "lucide-react";

// Sample user data (for demonstration)
const sampleUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+91 9876543210",
  address: "123 Main Street, Bangalore, Karnataka",
};

// Sample order history data
const sampleOrders = [
  { id: "ORD001", date: "2025-04-05", status: "Delivered", total: 24900 },
  { id: "ORD002", date: "2025-03-22", status: "Processing", total: 69999 },
  { id: "ORD003", date: "2025-03-10", status: "Cancelled", total: 49999 },
];

const CustomerProfile = () => {
  const [userData, setUserData] = useState(sampleUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(sampleUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserData(formData);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "text-green-600";
      case "Processing": return "text-blue-600";
      case "Cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">My Profile</h1>
        <p className="text-sm opacity-90">Manage your account and orders</p>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
            <User size={36} className="text-gray-500" />
          </div>
          <h2 className="text-lg font-medium">{userData.name}</h2>
          <p className="text-gray-500">{userData.email}</p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-4">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFormData(userData);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 py-2 border-b">
                  <span className="text-gray-500">Name</span>
                  <span className="col-span-2">{userData.name}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b">
                  <span className="text-gray-500">Email</span>
                  <span className="col-span-2">{userData.email}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b">
                  <span className="text-gray-500">Phone</span>
                  <span className="col-span-2">{userData.phone}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b">
                  <span className="text-gray-500">Address</span>
                  <span className="col-span-2">{userData.address}</span>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            {sampleOrders.length > 0 ? (
              <div className="space-y-4">
                {sampleOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Order #{order.id}</span>
                      <span className={getStatusColor(order.status)}>{order.status}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Date: {order.date}</p>
                      <p>Total: ₹{(order.total / 100).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p>You haven't placed any orders yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-gray-500" />
                  <span>Payment Methods</span>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="text-gray-500" />
                  <span>Notifications</span>
                </div>
                <Button variant="ghost" size="sm">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="text-gray-500" />
                  <span>Logout</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    // In a real app, handle logout and redirect
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerProfile;
