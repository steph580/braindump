import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Brain, Mail, Lock, User } from 'lucide-react';

// Constants
const AUTH_TABS = {
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
} as const;

const LOADING_TEXT = {
  SIGN_IN: 'Signing in...',
  SIGN_UP: 'Creating account...',
  GOOGLE: 'Connecting to Google...',
} as const;

const BUTTON_TEXT = {
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  GOOGLE: 'Continue with Google',
} as const;

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in. Check your inbox for the verification link.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Password should be at least 6 characters': 'Your password must be at least 6 characters long.',
  'Unable to validate email address: invalid format': 'Please enter a valid email address.',
  'Email rate limit exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
  'Invalid email or password': 'The email or password you entered is incorrect. Please try again.',
  'User not found': 'No account found with this email. Please sign up first.',
  'Network request failed': 'Connection error. Please check your internet and try again.',
  'Signup requires a valid password': 'Please enter a password to create your account.',
};

// Types
type AuthTab = typeof AUTH_TABS[keyof typeof AUTH_TABS];

interface FormState {
  email: string;
  password: string;
  displayName: string;
}

interface AuthError {
  message: string;
}

/**
 * Auth Component
 * 
 * Professional authentication interface with enhanced UX:
 * - Email/password authentication
 * - Google OAuth integration
 * - User-friendly error messages
 * - BrainDump branding with logo
 * - Form validation
 * - Automatic redirect for authenticated users
 * 
 * @component
 */
const Auth: React.FC = () => {
  // Hooks
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  /**
   * Converts technical error messages to user-friendly ones
   */
  const getFriendlyErrorMessage = useCallback((errorMessage: string): string => {
    // Check for exact matches first
    if (ERROR_MESSAGES[errorMessage]) {
      return ERROR_MESSAGES[errorMessage];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Default friendly message for unknown errors
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }, []);

  /**
   * Form field handlers
   */
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormState(prev => ({ ...prev, email: e.target.value }));
      if (error) setError('');
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormState(prev => ({ ...prev, password: e.target.value }));
      if (error) setError('');
    },
    [error]
  );

  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormState(prev => ({ ...prev, displayName: e.target.value }));
      if (error) setError('');
    },
    [error]
  );

  /**
   * Handles authentication errors with friendly messages
   */
  const handleAuthError = useCallback(
    (authError: AuthError, title: string): void => {
      const friendlyMessage = getFriendlyErrorMessage(authError.message);
      setError(friendlyMessage);
      toast({
        title,
        description: friendlyMessage,
        variant: 'destructive',
      });
    },
    [getFriendlyErrorMessage]
  );

  /**
   * Handles successful sign-in
   */
  const handleSignInSuccess = useCallback((): void => {
    toast({
      title: 'Welcome back! 🎉',
      description: 'Successfully signed in to your account.',
    });
    navigate('/', { replace: true });
  }, [navigate]);

  /**
   * Handles successful sign-up
   */
  const handleSignUpSuccess = useCallback((): void => {
    toast({
      title: 'Account created successfully! 🎉',
      description: 'Please check your email to verify your account before signing in.',
    });
  }, []);

  /**
   * Sign-in form submission handler
   */
  const handleSignIn = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      
      // Client-side validation
      if (!formState.email || !formState.password) {
        const errorMsg = 'Please enter both email and password.';
        setError(errorMsg);
        toast({
          title: 'Missing information',
          description: errorMsg,
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { error: signInError } = await signIn(
          formState.email,
          formState.password
        );

        if (signInError) {
          handleAuthError(signInError, 'Sign in failed');
        } else {
          handleSignInSuccess();
        }
      } catch (err) {
        console.error('Sign in error:', err);
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [formState.email, formState.password, signIn, handleAuthError, handleSignInSuccess]
  );

  /**
   * Sign-up form submission handler
   */
  const handleSignUp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      
      // Client-side validation
      if (!formState.email || !formState.password) {
        const errorMsg = 'Please enter both email and password.';
        setError(errorMsg);
        toast({
          title: 'Missing information',
          description: errorMsg,
          variant: 'destructive',
        });
        return;
      }

      if (formState.password.length < 6) {
        const errorMsg = 'Your password must be at least 6 characters long.';
        setError(errorMsg);
        toast({
          title: 'Password too short',
          description: errorMsg,
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { error: signUpError } = await signUp(
          formState.email,
          formState.password,
          formState.displayName
        );

        if (signUpError) {
          handleAuthError(signUpError, 'Sign up failed');
        } else {
          handleSignUpSuccess();
        }
      } catch (err) {
        console.error('Sign up error:', err);
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [
      formState.email,
      formState.password,
      formState.displayName,
      signUp,
      handleAuthError,
      handleSignUpSuccess,
    ]
  );

  /**
   * Google sign-in handler
   */
  const handleGoogleSignIn = useCallback(async (): Promise<void> => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error: googleError } = await signInWithGoogle();

      if (googleError) {
        handleAuthError(googleError, 'Google sign in failed');
      } else {
        toast({
          title: 'Welcome! 🎉',
          description: 'Successfully signed in with Google.',
        });
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      const errorMsg = 'Could not connect to Google. Please try again.';
      setError(errorMsg);
      toast({
        title: 'Connection error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle, handleAuthError, navigate]);

  // Early return for authenticated users
  if (user) {
    return null;
  }

  // Render helpers
  const renderLogo = (): React.ReactNode => (
    <div className="flex items-center justify-center gap-3 mb-2">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Brain className="h-8 w-8 text-primary" />
      </div>
      <span className="text-3xl font-bold">BrainDump</span>
    </div>
  );

  const renderFormField = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    icon: React.ReactNode,
    required: boolean = false
  ): React.ReactNode => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={loading || googleLoading}
          aria-invalid={!!error}
          aria-describedby={error ? 'auth-error' : undefined}
          className="pl-10"
        />
      </div>
    </div>
  );

  const renderErrorAlert = (): React.ReactNode => {
    if (!error) return null;

    return (
      <Alert variant="destructive" id="auth-error" role="alert">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  const renderGoogleButton = (): React.ReactNode => (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        aria-busy={googleLoading}
      >
        <svg
          className="h-5 w-5 mr-3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? LOADING_TEXT.GOOGLE : BUTTON_TEXT.GOOGLE}
      </Button>
    </div>
  );

  const renderSignInForm = (): React.ReactNode => (
    <TabsContent value={AUTH_TABS.SIGN_IN} className="space-y-4">
      <form onSubmit={handleSignIn} className="space-y-4" noValidate>
        {renderFormField(
          'signin-email',
          'Email',
          'email',
          'Enter your email',
          formState.email,
          handleEmailChange,
          <Mail className="h-4 w-4" />,
          true
        )}
        {renderFormField(
          'signin-password',
          'Password',
          'password',
          'Enter your password',
          formState.password,
          handlePasswordChange,
          <Lock className="h-4 w-4" />,
          true
        )}
        {renderErrorAlert()}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || googleLoading}
          aria-busy={loading}
        >
          {loading ? LOADING_TEXT.SIGN_IN : BUTTON_TEXT.SIGN_IN}
        </Button>
      </form>

      {renderGoogleButton()}
    </TabsContent>
  );

  const renderSignUpForm = (): React.ReactNode => (
    <TabsContent value={AUTH_TABS.SIGN_UP} className="space-y-4">
      <form onSubmit={handleSignUp} className="space-y-4" noValidate>
        {renderFormField(
          'signup-name',
          'Display Name (Optional)',
          'text',
          'Enter your display name',
          formState.displayName,
          handleDisplayNameChange,
          <User className="h-4 w-4" />,
          false
        )}
        {renderFormField(
          'signup-email',
          'Email',
          'email',
          'Enter your email',
          formState.email,
          handleEmailChange,
          <Mail className="h-4 w-4" />,
          true
        )}
        {renderFormField(
          'signup-password',
          'Password',
          'password',
          'Create a password (min. 6 characters)',
          formState.password,
          handlePasswordChange,
          <Lock className="h-4 w-4" />,
          true
        )}
        {renderErrorAlert()}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || googleLoading}
          aria-busy={loading}
        >
          {loading ? LOADING_TEXT.SIGN_UP : BUTTON_TEXT.SIGN_UP}
        </Button>
      </form>

      {renderGoogleButton()}
    </TabsContent>
  );

  // Main render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-2">
          {renderLogo()}
          <CardDescription className="text-base">
            Capture your thoughts and organize your mind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={AUTH_TABS.SIGN_IN} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6" role="tablist">
              <TabsTrigger value={AUTH_TABS.SIGN_IN} aria-label="Sign in tab">
                Sign In
              </TabsTrigger>
              <TabsTrigger value={AUTH_TABS.SIGN_UP} aria-label="Sign up tab">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {renderSignInForm()}
            {renderSignUpForm()}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;