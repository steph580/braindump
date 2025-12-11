import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-PAYPAL-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    logStep("Function started");

    const { subscription_id } = await req.json();
    if (!subscription_id) throw new Error("Subscription ID is required");

    // PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) throw new Error("PayPal credentials not configured");
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
    logStep("User authenticated", { userId: user.id });

    // Get PayPal access token
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
      throw new Error(`Failed to get PayPal access token: ${text}`);
    }

    const { access_token } = await authResponse.json();
    logStep("PayPal access token obtained");

    // Get subscription details
    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscription_id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      throw new Error(`Failed to get subscription details: ${errorText}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("Subscription details retrieved", { status: subscription.status });

    // Determine subscription status and end date
    let subscriptionStatus = "free";
    let subscriptionEnd: string | null = null;

    if (subscription.status === "ACTIVE") {
      subscriptionStatus = "premium";
      subscriptionEnd = subscription.billing_info?.next_billing_time ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Update Supabase profile
    await supabaseClient
      .from("profiles")
      .upsert({
        user_id: user.id,
        subscription_status: subscriptionStatus,
        subscription_end: subscriptionEnd,
        paypal_subscription_id: subscription_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    logStep("Profile updated", { subscriptionStatus, subscriptionEnd });

    return new Response(JSON.stringify({
      success: true,
      subscription_status: subscriptionStatus,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
