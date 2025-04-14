
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create a Supabase client for service role operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Format line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Convert to smallest currency unit (paise)
      },
      quantity: item.quantity,
    }));

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/customer/orders?success=true`,
      cancel_url: `${req.headers.get("origin")}/customer/cart?canceled=true`,
      metadata: {
        userId: userId || "guest",
      },
    });

    // If user is logged in, create a pending order in the database
    if (userId) {
      const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          total: orderTotal,
          status: 'Pending',
          stripe_session_id: session.id
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Error creating order:", orderError);
      } else if (order) {
        // Add order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: String(item.id),
          quantity: item.quantity,
          price: item.price
        }));
        
        // Insert all order items
        for (const item of orderItems) {
          const { error } = await supabaseAdmin
            .from('order_items')
            .insert(item);
            
          if (error) {
            console.error("Error adding order item:", error);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
