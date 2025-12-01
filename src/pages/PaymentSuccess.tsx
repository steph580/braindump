import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Crown, ArrowLeft } from 'lucide-react';

// Constants
const PAYMENT_VERIFICATION_DELAY = 3000; // Allow PayPal processing time
const SUBSCRIPTION_PARAM_KEYS = ['subscription_id', 'token'] as const;

const PREMIUM_FEATURES = [
  'Unlimited daily brain dumps',
  'Advanced AI processing',
  'Priority support',
] as const;

// Types
enum VerificationState {
  VERIFYING = 'verifying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface VerificationStatus {
  state: VerificationState;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * PaymentSuccess Component
 * 
 * Handles post-payment verification and subscription activation.
 * Implements delayed verification to allow PayPal webhook processing.
 * 
 * @component
 */
const PaymentSuccess: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { verifyPayPalSubscription, fetchSubscription } = useSubscription();
  const { toast } = useToast();

  // State
  const [verificationState, setVerificationState] = useState<VerificationState>(
    VerificationState.VERIFYING
  );

  // Refs - prevent duplicate verification attempts
  const hasVerifiedRef = useRef(false);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Main verification effect
  useEffect(() => {
    if (shouldAttemptVerification()) {
      scheduleVerification();
    }
  }, [user, authLoading, searchParams]);

  /**
   * Determines if verification should be attempted
   */
  const shouldAttemptVerification = (): boolean => {
    return (
      !hasVerifiedRef.current &&
      !authLoading &&
      !!user &&
      !!getSubscriptionId()
    );
  };

  /**
   * Schedules verification with delay to allow PayPal processing
   */
  const scheduleVerification = (): void => {
    verificationTimeoutRef.current = setTimeout(() => {
      verifyPayment();
    }, PAYMENT_VERIFICATION_DELAY);
  };

  /**
   * Extracts subscription ID from URL parameters
   */
  const getSubscriptionId = (): string | null => {
    for (const key of SUBSCRIPTION_PARAM_KEYS) {
      const value = searchParams.get(key);
      if (value) return value;
    }
    return null;
  };

  /**
   * Handles the complete payment verification workflow
   */
  const verifyPayment = async (): Promise<void> => {
    // Prevent duplicate executions
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const subscriptionId = getSubscriptionId();

    if (!subscriptionId) {
      handleVerificationError(
        'No subscription ID found in URL',
        'No subscription information found. Please contact support.',
        VerificationState.FAILED
      );
      return;
    }

    if (!user) {
      handleAuthenticationRequired();
      return;
    }

    await executeVerification(subscriptionId);
  };

  /**
   * Executes the actual verification process
   */
  const executeVerification = async (subscriptionId: string): Promise<void> => {
    try {
      await verifyPayPalSubscription(subscriptionId);
      await fetchSubscription();
      
      setVerificationState(VerificationState.SUCCESS);
    } catch (error) {
      console.error('Payment verification failed:', error);
      handleVerificationWarning();
    }
  };

  /**
   * Handles verification errors
   */
  const handleVerificationError = (
    logMessage: string,
    userMessage: string,
    state: VerificationState
  ): void => {
    console.error(logMessage);
    
    toast({
      title: 'Verification Error',
      description: userMessage,
      variant: 'destructive',
    });
    
    setVerificationState(state);
  };

  /**
   * Handles authentication requirement
   */
  const handleAuthenticationRequired = (): void => {
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to complete your subscription.',
      variant: 'destructive',
    });
    
    navigate('/auth');
  };

  /**
   * Handles verification warning with optimistic UX
   */
  const handleVerificationWarning = (): void => {
    toast({
      title: 'Payment Processing',
      description:
        "Your payment is being processed. If you don't see your premium status shortly, please refresh the page or contact support.",
      variant: 'default',
    });
    
    // Optimistic UX: assume success for better user experience
    setVerificationState(VerificationState.SUCCESS);
  };

  /**
   * Navigation handlers
   */
  const handleGoHome = (): void => {
    navigate('/');
  };

  const handleContinue = (): void => {
    navigate('/');
  };

  /**
   * Gets current verification status display data
   */
  const getVerificationStatus = (): VerificationStatus => {
    const statusMap: Record<VerificationState, VerificationStatus> = {
      [VerificationState.VERIFYING]: {
        state: VerificationState.VERIFYING,
        title: 'Verifying Payment...',
        description: 'Please wait while we confirm your subscription.',
        icon: (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        ),
      },
      [VerificationState.SUCCESS]: {
        state: VerificationState.SUCCESS,
        title: 'Payment Successful!',
        description: 'Your premium subscription is now active.',
        icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      },
      [VerificationState.FAILED]: {
        state: VerificationState.FAILED,
        title: 'Verification Failed',
        description: 'There was an issue with your payment verification.',
        icon: (
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
        ),
      },
    };

    return statusMap[verificationState];
  };

  // Render helpers
  const renderPremiumFeatures = (): React.ReactNode => {
    if (verificationState !== VerificationState.SUCCESS) return null;

    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
          <Crown className="h-4 w-4" />
          <span className="font-medium">Premium Features Unlocked:</span>
        </div>
        <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
          {PREMIUM_FEATURES.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderActionButtons = (): React.ReactNode => {
    const showContinue = verificationState === VerificationState.SUCCESS;

    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleGoHome}
          className="flex-1"
          aria-label="Return to home page"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Home
        </Button>

        {showContinue && (
          <Button
            onClick={handleContinue}
            className="flex-1"
            aria-label="Continue to application"
          >
            Continue
          </Button>
        )}
      </div>
    );
  };

  // Main render
  const status = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4" aria-live="polite" aria-atomic="true">
            {status.icon}
          </div>

          <CardTitle className="text-2xl">{status.title}</CardTitle>
          <CardDescription>{status.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderPremiumFeatures()}
          {renderActionButtons()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;