
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Order {
  id: string;
  user_id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
}

interface RecentOrdersListProps {
  orders: Order[];
  isLoading: boolean;
}

export const RecentOrdersList = ({ orders, isLoading }: RecentOrdersListProps) => {
  const formatOrderId = (id: string) => {
    return id ? 'ORD-' + id.slice(-3) : 'Unknown';
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Orders</CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center p-3 border rounded-md animate-pulse">
                <div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">{formatOrderId(order.id)}</p>
                  <p className="text-sm text-gray-500">{order.customer || "No customer name"}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                  <p className={`text-xs ${
                    order.status === "Delivered" 
                      ? "text-green-500" 
                      : order.status === "Processing" 
                        ? "text-orange-500" 
                        : order.status === "Shipped"
                          ? "text-blue-500"
                          : "text-red-500"
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
