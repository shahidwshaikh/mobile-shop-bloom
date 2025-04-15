
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetailsProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  id: string;
  customer: string;
  status: string;
  total: number;
  created_at: string;
  address: string;
  pincode: string;
  phone: string;
  items: OrderItem[];
}

export const OrderDetails = ({ orderId, open, onOpenChange }: OrderDetailsProps) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails(orderId);
    }
  }, [open, orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Fetch order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          address,
          pincode,
          user_id
        `)
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;
      
      // Fetch customer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', orderData.user_id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          price,
          quantity
        `)
        .eq('order_id', id);
        
      if (itemsError) throw itemsError;
      
      // Fetch product details for each order item
      const itemsWithProductDetails = await Promise.all(
        orderItems.map(async (item) => {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('name')
            .eq('id', item.product_id)
            .single();
            
          if (productError) {
            console.error("Error fetching product:", productError);
            return {
              ...item,
              product_name: "Unknown Product"
            };
          }
          
          return {
            ...item,
            product_name: productData.name
          };
        })
      );
      
      // Combine all data
      setOrderDetails({
        id: orderData.id,
        customer: profileData?.full_name || 'Unknown Customer',
        status: orderData.status,
        total: orderData.total,
        created_at: orderData.created_at,
        address: orderData.address || 'No address provided',
        pincode: orderData.pincode || 'No pincode provided',
        phone: profileData?.phone || 'No phone provided',
        items: itemsWithProductDetails
      });
      
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details #{orderId.slice(-6)}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading order details...</p>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Customer Information</h3>
                <p className="font-medium">{orderDetails.customer}</p>
                <p className="text-sm">{orderDetails.phone}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Order Status</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(orderDetails.status)}>{orderDetails.status}</Badge>
                  <span className="text-sm">{formatDate(orderDetails.created_at)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Shipping Address</h3>
                <p className="text-sm">{orderDetails.address}</p>
                <p className="text-sm">Pincode: {orderDetails.pincode}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Order Total</h3>
                <p className="font-bold text-lg text-shop-purple">₹{orderDetails.total.toLocaleString()}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{(item.price * item.quantity).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right font-medium">Subtotal</TableCell>
                    <TableCell className="text-right">
                      ₹{(orderDetails.total - 99).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right font-medium">Delivery Fee</TableCell>
                    <TableCell className="text-right">₹99</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold">₹{orderDetails.total.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Order details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
