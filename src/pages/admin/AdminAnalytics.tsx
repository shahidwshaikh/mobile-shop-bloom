
import { BarChart, LineChart, PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNavbar from "@/components/navigation/AdminNavbar";

// Sample data for charts
const revenueData = [
  { name: 'Jan', amount: 45000 },
  { name: 'Feb', amount: 52000 },
  { name: 'Mar', amount: 49000 },
  { name: 'Apr', amount: 63000 },
  { name: 'May', amount: 58000 },
  { name: 'Jun', amount: 72000 },
];

const categoryData = [
  { name: 'Smartphones', value: 65 },
  { name: 'Accessories', value: 15 },
  { name: 'Wearables', value: 12 },
  { name: 'Tablets', value: 8 },
];

const orderData = [
  { name: 'Mon', orders: 12 },
  { name: 'Tue', orders: 19 },
  { name: 'Wed', orders: 15 },
  { name: 'Thu', orders: 21 },
  { name: 'Fri', orders: 25 },
  { name: 'Sat', orders: 32 },
  { name: 'Sun', orders: 18 },
];

const COLORS = ['#6366F1', '#14B8A6', '#F59E0B', '#EF4444'];

const AdminAnalytics = () => {
  return (
    <div className="pb-20">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-medium">Analytics</h1>
      </div>
      
      <div className="pt-16 p-4 space-y-6">
        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <LineChart
                    width={300}
                    height={300}
                    data={revenueData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="amount" stroke="#6366F1" />
                  </LineChart>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart
                    width={300}
                    height={300}
                    data={orderData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366F1" />
                  </BarChart>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={categoryData}
                      cx={150}
                      cy={150}
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm">Total Sales</h3>
              <p className="text-xl font-bold mt-1">₹339,000</p>
              <p className="text-xs text-green-500">↑ 12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm">Total Orders</h3>
              <p className="text-xl font-bold mt-1">142</p>
              <p className="text-xs text-green-500">↑ 8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm">Avg. Order Value</h3>
              <p className="text-xl font-bold mt-1">₹2,387</p>
              <p className="text-xs text-green-500">↑ 3% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm">Active Customers</h3>
              <p className="text-xl font-bold mt-1">98</p>
              <p className="text-xs text-green-500">↑ 15% from last month</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AdminNavbar />
    </div>
  );
};

export default AdminAnalytics;
