import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function EmailVerificationBanner() {
  const { isEmailVerified, resendVerification, user } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  // Don't show banner if email is verified or user is not logged in
  if (isEmailVerified || !user) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    const { error } = await resendVerification();
    
    if (error) {
      toast({
        title: "Failed to resend verification",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
    }
    
    setIsResending(false);
  };

  return (
    <Alert className="mb-6 border-warning/50 bg-warning/10">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Please verify your email address to prevent exploitation and secure your account.</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResendVerification}
          disabled={isResending}
          className="ml-4"
        >
          {isResending ? 'Sending...' : 'Resend Email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}