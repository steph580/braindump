import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function --ic
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";

    logStep("PayPal credentials check", { 
      hasClientId: !!paypalClientId, 
      hasClientSecret: !!paypalClientSecret,
      baseUrl: paypalBaseUrl 
    });

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get PayPal access token
    logStep(`Requesting PayPal access token from: ${paypalBaseUrl}/v1/oauth2/token`);
    
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    logStep(`PayPal auth response status: ${authResponse.status}`);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      logStep("PayPal auth error details", { status: authResponse.status, error: errorText });
      throw new Error(`Failed to get PayPal access token: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    logStep("PayPal access token obtained");

    // First create a product
    const productData = {
      name: "BrainDump Premium",
      description: "Unlimited brain dumps and calendar sync",
      type: "SERVICE",
      category: "SOFTWARE"
    };

    const productResponse = await fetch(`${paypalBaseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(productData)
    });

    let productId;
    if (productResponse.ok) {
      const product = await productResponse.json();
      productId = product.id;
      logStep("Product created", { productId });
    } else {
      // Product might already exist, use a default ID
      productId = "BRAINDUMP_PREMIUM";
      logStep("Using default product ID", { productId });
    }

    // Create subscription plan
    const planData = {
      product_id: productId,
      name: "BrainDump Premium Monthly",
      description: "Monthly subscription for unlimited brain dumps",
      status: "ACTIVE",
      billing_cycles: [{
        frequency: {
          interval_unit: "MONTH",
          interval_count: 1
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: "8.00",
            currency_code: "USD"
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0",
        inclusive: false
      }
    };

    const planResponse = await fetch(`${paypalBaseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(planData)
    });

    if (!planResponse.ok) {
      const errorData = await planResponse.text();
      logStep("Plan creation failed", { error: errorData });
      throw new Error(`Failed to create PayPal plan: ${errorData}`);
    }

    const plan = await planResponse.json();
    logStep("Plan created", { planId: plan.id });

    // Create subscription with the new plan
    const subscriptionData = {
      plan_id: plan.id,
      subscriber: {
        name: {
          given_name: user.email.split('@')[0],
          surname: "User"
        },
        email_address: user.email
      },
      application_context: {
        brand_name: "BrainDump",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: `${req.headers.get("origin")}/payment-success`,
        cancel_url: `${req.headers.get("origin")}/`
      }
    };

    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.text();
      logStep("PayPal subscription creation failed", { error: errorData });
      throw new Error(`Failed to create PayPal subscription: ${errorData}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("PayPal subscription created", { subscriptionId: subscription.id });

    // Find approval link
    const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');
    
    if (!approvalLink) {
      throw new Error("No approval link found in PayPal response");
    }

    // Store subscription ID in database
    await supabaseClient
      .from('profiles')
      .upsert({
        user_id: user.id,
        paypal_subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    logStep("Subscription stored in database");

    return new Response(JSON.stringify({ 
      approval_url: approvalLink.href,
      subscription_id: subscription.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-paypal-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});