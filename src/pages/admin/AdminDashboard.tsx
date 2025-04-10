
import { BarChart, TrendingUp, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNavbar from "@/components/navigation/AdminNavbar";

const AdminDashboard = () => {
  // Sample data
  const stats = [
    {
      title: "Total Sales",
      value: "₹45,231",
      change: "+12.5%",
      icon: <TrendingUp className="text-green-500" />,
      trend: "up"
    },
    {
      title: "Products",
      value: "24",
      change: "+2",
      icon: <Package className="text-blue-500" />,
      trend: "up"
    },
    {
      title: "New Orders",
      value: "12",
      change: "+3",
      icon: <ShoppingBag className="text-purple-500" />,
      trend: "up"
    },
    {
      title: "Customers",
      value: "42",
      change: "+5",
      icon: <Users className="text-orange-500" />,
      trend: "up"
    }
  ];
  
  const recentOrders = [
    { id: "ORD-001", customer: "Raj Sharma", total: "₹12,500", status: "Processing" },
    { id: "ORD-002", customer: "Priya Patel", total: "₹7,999", status: "Delivered" },
    { id: "ORD-003", customer: "Amit Kumar", total: "₹24,999", status: "Shipped" }
  ];

  return (
    <div className="pb-20">
      <div className="bg-shop-purple text-white p-4">
        <h1 className="text-xl font-bold">Shop Dashboard</h1>
        <p className="text-sm opacity-90">Welcome back, Shop Owner</p>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="p-2 rounded-full bg-gray-100 mb-2">
                  {stat.icon}
                </div>
                <p className="text-xs text-gray-500">{stat.title}</p>
                <h3 className="text-lg font-bold">{stat.value}</h3>
                <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sales Overview</CardTitle>
            <CardDescription>Total sales of the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <BarChart size={180} className="text-gray-300" />
              <p className="absolute text-gray-500 text-sm">Sales chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                    <p className={`text-xs ${
                      order.status === "Delivered" 
                        ? "text-green-500" 
                        : order.status === "Processing" 
                          ? "text-orange-500" 
                          : "text-blue-500"
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminDashboard;
