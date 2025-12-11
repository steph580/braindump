import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Logging helper
const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYPAL-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    logStep("Function started");

    // PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    logStep("PayPal credentials verified");

    // Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error(`Authentication failed: ${userError?.message}`);
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const text = await authResponse.text();
      throw new Error(`PayPal token request failed: ${authResponse.status} - ${text}`);
    }

    const { access_token } = await authResponse.json();
    logStep("PayPal access token obtained");

    // Create subscription product (or use default)
    const productResponse = await fetch(`${paypalBaseUrl}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name: "BrainDump Premium",
        description: "Unlimited brain dumps and calendar sync",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });

    let productId: string;
    if (productResponse.ok) {
      const product = await productResponse.json();
      productId = product.id;
      logStep("Product created", { productId });
    } else {
      productId = "BRAINDUMP_PREMIUM";
      logStep("Using default product ID", { productId });
    }

    // Create subscription plan
    const planResponse = await fetch(`${paypalBaseUrl}/v1/billing/plans`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        product_id: productId,
        name: "BrainDump Premium Monthly",
        description: "Monthly subscription for unlimited brain dumps",
        status: "ACTIVE",
        billing_cycles: [{
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: { fixed_price: { value: "8.00", currency_code: "USD" } },
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: "0", currency_code: "USD" },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3
        },
        taxes: { percentage: "0", inclusive: false }
      }),
    });

    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      throw new Error(`Plan creation failed: ${errorText}`);
    }
    const plan = await planResponse.json();
    logStep("Plan created", { planId: plan.id });

    // Create subscription
    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: plan.id,
        subscriber: {
          name: { given_name: user.email.split("@")[0], surname: "User" },
          email_address: user.email
        },
        application_context: {
          brand_name: "BrainDump",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: { payer_selected: "PAYPAL", payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED" },
          return_url: `${req.headers.get("origin")}/payment-success`,
          cancel_url: `${req.headers.get("origin")}/`
        }
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      throw new Error(`Subscription creation failed: ${errorText}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("Subscription created", { subscriptionId: subscription.id });

    const approvalLink = subscription.links.find((link: any) => link.rel === "approve");
    if (!approvalLink) throw new Error("No approval link found");

    // Store subscription in Supabase
    await supabaseClient
      .from("profiles")
      .upsert({
        user_id: user.id,
        paypal_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    logStep("Subscription stored in database");

    return new Response(JSON.stringify({ approval_url: approvalLink.href, subscription_id: subscription.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
