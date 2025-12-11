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

type AuthTab = typeof AUTH_TABS[keyof typeof AUTH_TABS];

interface FormState {
  email: string;
  password: string;
  displayName: string;
}

interface AuthError {
  message: string;
}

const Auth: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({ ...prev, email: e.target.value }));
      setError('');
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({ ...prev, password: e.target.value }));
      setError('');
    },
    []
  );

  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({ ...prev, displayName: e.target.value }));
      setError('');
    },
    []
  );

  const handleAuthError = useCallback((authError: AuthError, title: string) => {
    setError(authError.message);
    toast({
      title,
      description: authError.message,
      variant: 'destructive',
    });
  }, []);

  const handleSignInSuccess = useCallback(() => {
    toast({
      title: 'Welcome back!',
      description: 'Successfully signed in.',
    });
    navigate('/home');
  }, [navigate]);

  const handleSignUpSuccess = useCallback(() => {
    toast({
      title: 'Account created',
      description: 'Verify your email to continue.',
    });
  }, []);

  const handleSignIn = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const { error: signInError } = await signIn(
          formState.email,
          formState.password
        );

        if (signInError) {
          handleAuthError(signInError, 'Sign-in failed');
        } else {
          handleSignInSuccess();
        }
      } finally {
        setLoading(false);
      }
    },
    [formState.email, formState.password, signIn]
  );

  const handleSignUp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!acceptedTerms) {
        setError('You must accept the Terms & Conditions to continue.');
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
          handleAuthError(signUpError, 'Sign-up failed');
        } else {
          handleSignUpSuccess();
        }
      } finally {
        setLoading(false);
      }
    },
    [formState.email, formState.password, formState.displayName, acceptedTerms]
  );

  if (user) return null;

  const renderField = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required = false
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={loading}
        className="text-sm"
      />
    </div>
  );

  const renderError = () =>
    error ? (
      <Alert variant="destructive">
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-md rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">BrainDump</CardTitle>
          <CardDescription className="text-xs">
            Capture your thoughts. Organize your mind.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={AUTH_TABS.SIGN_IN} className="w-full">
            <TabsList className="grid w-full grid-cols-2 text-sm">
              <TabsTrigger value={AUTH_TABS.SIGN_IN}>Sign In</TabsTrigger>
              <TabsTrigger value={AUTH_TABS.SIGN_UP}>Sign Up</TabsTrigger>
            </TabsList>

            {/* SIGN IN */}
            <TabsContent value={AUTH_TABS.SIGN_IN} className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4 text-sm">
                {renderField('email', 'Email', 'email', 'Enter your email', formState.email, handleEmailChange, true)}
                {renderField('password', 'Password', 'password', 'Enter your password', formState.password, handlePasswordChange, true)}
                {renderError()}

                <Button type="submit" className="w-full text-sm py-2" disabled={loading}>
                  {loading ? LOADING_TEXT.SIGN_IN : BUTTON_TEXT.SIGN_IN}
                </Button>
              </form>
            </TabsContent>

            {/* SIGN UP */}
            <TabsContent value={AUTH_TABS.SIGN_UP} className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4 text-sm">
                {renderField('name', 'Display Name', 'text', 'Your name', formState.displayName, handleDisplayNameChange)}
                {renderField('email2', 'Email', 'email', 'Enter your email', formState.email, handleEmailChange, true)}
                {renderField('password2', 'Password', 'password', 'Create a password', formState.password, handlePasswordChange, true)}

                {/* TERMS */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-3 w-3"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                  />
                  <Label htmlFor="terms" className="text-xs">
                    I agree to the{' '}
                    <span className="underline cursor-pointer">Terms & Conditions</span> and{' '}
                    <span className="underline cursor-pointer">Privacy Policy</span>.
                  </Label>
                </div>

                {renderError()}

                <Button type="submit" className="w-full text-sm py-2" disabled={loading}>
                  {loading ? LOADING_TEXT.SIGN_UP : BUTTON_TEXT.SIGN_UP}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
