import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { subscription_id } = await req.json();
    if (!subscription_id) {
      throw new Error("Subscription ID is required");
    }

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
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get PayPal access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    logStep("PayPal access token obtained");

    // Get subscription details from PayPal
    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscription_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.text();
      logStep("Failed to get subscription details", { error: errorData });
      throw new Error(`Failed to get subscription details: ${errorData}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("Subscription details retrieved", { status: subscription.status });

    // Update user profile based on subscription status
    let subscriptionStatus = 'free';
    let subscriptionEnd = null;

    if (subscription.status === 'ACTIVE') {
      subscriptionStatus = 'premium';
      // Calculate end date (30 days from now for monthly subscription)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      subscriptionEnd = endDate.toISOString();
    }

    await supabaseClient
      .from('profiles')
      .upsert({
        user_id: user.id,
        subscription_status: subscriptionStatus,
        subscription_end: subscriptionEnd,
        paypal_subscription_id: subscription_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    logStep("Profile updated with subscription status", { status: subscriptionStatus });

    return new Response(JSON.stringify({ 
      success: true,
      subscription_status: subscriptionStatus,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-paypal-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});