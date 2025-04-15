
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "./OrderDetails";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface OrderListItemProps {
  id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
  items: number;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

export const OrderListItem = ({
  id,
  customer,
  status,
  total,
  created_at,
  items,
  onUpdateStatus
}: OrderListItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">#{id.slice(-6)}</h3>
                <Badge className={getStatusColor(status)}>{status}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{customer}</p>
              <p className="text-xs text-gray-500">{formatDate(created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-shop-purple">₹{total.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{items} items</p>
            </div>
          </div>
          <div className="mt-4">
            <Select
              value={status}
              onValueChange={(value) => onUpdateStatus(id, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowDetails(true)}
            >
              <span>View Details</span>
              <ExternalLink size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <OrderDetails 
        orderId={id} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />
    </>
  );
};
