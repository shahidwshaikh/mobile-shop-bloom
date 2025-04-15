
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.5";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

interface RequestBody {
  items: CartItem[];
  userId: string;
  customerInfo: CustomerInfo;
}

// Add CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.text();
    
    if (!body || body.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "Request body is empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    let data: RequestBody;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("JSON parsing error:", e, "Raw body:", body);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { items, userId, customerInfo } = data;
    
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No items provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Calculate total order amount
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 99; // Adding delivery fee
    
    // Update profile with customer information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: customerInfo.name,
        phone: customerInfo.phone
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error("Error updating profile:", profileError);
    }
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total: total,
        status: 'Processing',
        address: customerInfo.address,
        pincode: customerInfo.pincode
      })
      .select()
      .single();
      
    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create order items" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        order: { id: order.id }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
