
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const { items, userId } = await req.json();
    
    if (!items || !items.length) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client for service role operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate order total
    const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total: orderTotal,
        status: 'Processing'
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: orderError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: String(item.id),
      quantity: item.quantity,
      price: item.price
    }));
    
    // Insert all order items
    let hasOrderItemError = false;
    for (const item of orderItems) {
      const { error } = await supabaseAdmin
        .from('order_items')
        .insert(item);
        
      if (error) {
        console.error("Error adding order item:", error);
        hasOrderItemError = true;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        hasErrors: hasOrderItemError 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
