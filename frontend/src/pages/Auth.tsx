import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Lottie from 'lottie-react';
import loadingAnimation from '@/assets/loading.json';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Check for reset token in URL
    const tokenParam = searchParams.get('token');

    if (tokenParam) {
      // If user is logged in, log them out first for security
      if (user) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('is_paid');
      }
      // Navigate to reset password page or handle reset token
      navigate(`/reset-password?token=${tokenParam}`);
    } else if (user) {
      // Only redirect to dashboard if not trying to reset password
      navigate('/dashboard');
    }
  }, [user, navigate, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    const result = await signInWithGoogle();

    setIsLoading(false);

    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4'>
      {isLoading && (
        <div className='fixed inset-0 z-[1] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-4'>
            <Lottie
              animationData={loadingAnimation}
              loop
              className='w-28 h-28'
            />
            <p className='text-sm font-medium text-foreground'>
              Please wait, processing...
            </p>
          </div>
        </div>
      )}

      <div className='w-full max-w-md'>
        <div className='text-center mb-6'>
          <div className='flex items-center justify-center gap-1 mb-0 P-0'>
            <img
              src='/nav_logo.jpeg'
              alt='AB Institute Logo'
              className='h-30 w-40 object-cover mb-2'
            />
          </div>
          <p className='text-muted-foreground'>
            Welcome to your learning portal
          </p>
        </div>

        <Card className='border-border/50 shadow-lg'>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='login'>Login</TabsTrigger>
                <TabsTrigger value='signup'>Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value='login' className='mt-4'>
                <div className='space-y-4'>
                  <div className='text-center mb-4'>
                    <h3 className='text-lg font-medium'>Welcome Back!</h3>
                    <p className='text-sm text-muted-foreground'>
                      Sign in to your account using Google
                    </p>
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full h-12 text-base'
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24'>
                      <path
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        fill='#4285F4'
                      />
                      <path
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        fill='#34A853'
                      />
                      <path
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        fill='#FBBC05'
                      />
                      <path
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        fill='#EA4335'
                      />
                    </svg>
                    Sign in with Google
                  </Button>

                  <p className='text-xs text-center text-muted-foreground pt-2'>
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </TabsContent>

              <TabsContent value='signup' className='mt-4'>
                <div className='space-y-4'>
                  <div className='text-center mb-4'>
                    <h3 className='text-lg font-medium'>Create an Account</h3>
                    <p className='text-sm text-muted-foreground'>
                      Sign up using your Google account
                    </p>
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full h-12 text-base'
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24'>
                      <path
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        fill='#4285F4'
                      />
                      <path
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        fill='#34A853'
                      />
                      <path
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        fill='#FBBC05'
                      />
                      <path
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        fill='#EA4335'
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  <p className='text-xs text-center text-muted-foreground pt-2'>
                    By creating an account, you agree to our Terms of Service
                    and Privacy Policy
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
