
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminNavbar from "@/components/navigation/AdminNavbar";

// Sample orders data
const sampleOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2023-04-10",
    amount: 24900,
    status: "Delivered",
    items: 2
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2023-04-09",
    amount: 119900,
    status: "Processing",
    items: 1
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    date: "2023-04-08",
    amount: 69999,
    status: "Shipped",
    items: 3
  },
  {
    id: "ORD-004",
    customer: "Alice Williams",
    date: "2023-04-07",
    amount: 45000,
    status: "Cancelled",
    items: 2
  }
];

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredOrders = sampleOrders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-yellow-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Manage Orders</h1>
      </div>
      
      <div className="pt-16 p-4">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={handleSearch}
          className="mb-4"
        />
        
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-shop-purple">₹{order.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminOrders;
