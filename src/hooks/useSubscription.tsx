import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SubscriptionData {
  subscription_status: 'free' | 'premium';
  subscription_end: string | null;
  paypal_subscription_id: string | null;
  daily_dump_count: number;
  last_dump_date: string | null;
}

interface DumpLimitResult {
  can_dump: boolean;
  remaining_dumps: number;
  is_premium: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_end, paypal_subscription_id, daily_dump_count, last_dump_date')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data ? {
        subscription_status: (data.subscription_status as 'free' | 'premium') || 'free',
        subscription_end: data.subscription_end,
        paypal_subscription_id: data.paypal_subscription_id,
        daily_dump_count: data.daily_dump_count || 10,
        last_dump_date: data.last_dump_date
      } : {
        subscription_status: 'free',
        subscription_end: null,
        paypal_subscription_id: null,
        daily_dump_count: 10,
        last_dump_date: null
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDumpLimit = async (): Promise<DumpLimitResult> => {
    if (!user) {
      return { can_dump: false, remaining_dumps: 10, is_premium: false };
    }

    try {
      const { data, error } = await supabase.rpc('check_daily_limit', {
        p_user_id: user.id
      });

      if (error) throw error;

      await fetchSubscription(); // Refresh subscription data
      return data as unknown as DumpLimitResult;
    } catch (error) {
      console.error('Error checking dump limit:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limit",
        variant: "destructive",
      });
      return { can_dump: false, remaining_dumps: 10, is_premium: false };
    }
  };

  const createPayPalSubscription = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      return data.approval_url;
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
      return null;
    }
  };

  const verifyPayPalSubscription = async (subscriptionId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('verify-paypal-subscription', {
        body: { subscription_id: subscriptionId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      await fetchSubscription(); // Refresh subscription data

      return data;
    } catch (error) {
      console.error('Error verifying PayPal subscription:', error);
      toast({
        title: "Error",
        description: "Failed to verify subscription",
        variant: "destructive",
      });
    }
  };

  const isPremium = subscription?.subscription_status === 'premium';
  const isSubscriptionActive = isPremium && subscription?.subscription_end && new Date(subscription.subscription_end) > new Date();

  return {
    subscription,
    loading,
    isPremium,
    checkDumpLimit,
    createPayPalSubscription,
    verifyPayPalSubscription,
    fetchSubscription,
  };
};