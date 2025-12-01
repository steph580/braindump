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
import { toast } from '@/hooks/use-toast';

// Constants
const AUTH_TABS = {
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
} as const;

const LOADING_TEXT = {
  SIGN_IN: 'Signing in...',
  SIGN_UP: 'Creating account...',
} as const;

const BUTTON_TEXT = {
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
} as const;

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
 * Handles user authentication with sign-in and sign-up functionality.
 * Features include:
 * - Dual-tab interface for sign-in/sign-up
 * - Form validation
 * - Error handling with user feedback
 * - Automatic redirect for authenticated users
 * - Email verification flow
 * 
 * @component
 */
const Auth: React.FC = () => {
  // Hooks
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
   * Resets form state
   */
  const resetFormState = useCallback((): void => {
    setError('');
    setLoading(false);
  }, []);

  /**
   * Handles authentication errors
   */
  const handleAuthError = useCallback((authError: AuthError, title: string): void => {
    setError(authError.message);
    toast({
      title,
      description: authError.message,
      variant: 'destructive',
    });
  }, []);

  /**
   * Handles successful sign-in
   */
  const handleSignInSuccess = useCallback((): void => {
    toast({
      title: 'Welcome back!',
      description: 'Successfully signed in to your account.',
    });
    navigate('/');
  }, [navigate]);

  /**
   * Handles successful sign-up
   */
  const handleSignUpSuccess = useCallback((): void => {
    toast({
      title: 'Account created successfully',
      description: 'Please check your email to verify your account.',
    });
  }, []);

  /**
   * Sign-in form submission handler
   */
  const handleSignIn = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const { error: signInError } = await signIn(
          formState.email,
          formState.password
        );

        if (signInError) {
          handleAuthError(signInError, 'Sign in failed, please try again');
        } else {
          handleSignInSuccess();
        }
      } catch (err) {
        console.error('Sign in error:', err);
        setError('An unexpected error occurred');
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
        setError('An unexpected error occurred');
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

  // Early return for authenticated users
  if (user) {
    return null;
  }

  // Render helpers
  const renderFormField = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required: boolean = false
  ): React.ReactNode => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={loading}
        aria-invalid={!!error}
        aria-describedby={error ? 'auth-error' : undefined}
      />
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
          true
        )}
        {renderFormField(
          'signin-password',
          'Password',
          'password',
          'Enter your password',
          formState.password,
          handlePasswordChange,
          true
        )}
        {renderErrorAlert()}
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? LOADING_TEXT.SIGN_IN : BUTTON_TEXT.SIGN_IN}
        </Button>
      </form>
    </TabsContent>
  );

  const renderSignUpForm = (): React.ReactNode => (
    <TabsContent value={AUTH_TABS.SIGN_UP} className="space-y-4">
      <form onSubmit={handleSignUp} className="space-y-4" noValidate>
        {renderFormField(
          'signup-name',
          'Display Name',
          'text',
          'Enter your display name',
          formState.displayName,
          handleDisplayNameChange,
          false
        )}
        {renderFormField(
          'signup-email',
          'Email',
          'email',
          'Enter your email',
          formState.email,
          handleEmailChange,
          true
        )}
        {renderFormField(
          'signup-password',
          'Password',
          'password',
          'Create a password',
          formState.password,
          handlePasswordChange,
          true
        )}
        {renderErrorAlert()}
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? LOADING_TEXT.SIGN_UP : BUTTON_TEXT.SIGN_UP}
        </Button>
      </form>
    </TabsContent>
  );

  // Main render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BrainDump</CardTitle>
          <CardDescription>
            Capture your thoughts and organize your mind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={AUTH_TABS.SIGN_IN} className="w-full">
            <TabsList className="grid w-full grid-cols-2" role="tablist">
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