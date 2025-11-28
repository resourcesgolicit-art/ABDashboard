import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authAPI, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and verify token on app load
    const initializeAuth = async () => {
      try {
        setLoading(true);

        const storedUser = authAPI.getStoredUser();
        const token = authAPI.getToken();

        // If no stored data, skip verification and set loading to false immediately
        if (!storedUser || !token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Only verify token if we have stored data
        try {
          const response = await authAPI.verifyToken();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear storage
            authAPI.logout();
            setUser(null);
          }
        } catch (error) {
          console.log('Token verification failed:', error);
          // If verification fails, clear storage but don't show error
          authAPI.logout();
          setUser(null);
        }
      } catch (error) {
        console.log('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth initialization timeout - forcing loading to false');
      setLoading(false);
      setUser(null);
    }, 15000); // 15 second max timeout

    initializeAuth().then(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const response = await authAPI.login({ email, password });

    if (response.success && response.data) {
      setUser(response.data.user);
      setLoading(false);
      return { error: null };
    }

    setLoading(false);
    return { error: response.message || 'Login failed' };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);

    const response = await authAPI.register({ email, password, name });

    if (response.success && response.data) {
      setUser(response.data.user);
      setLoading(false);
      return { error: null };
    }

    setLoading(false);
    return { error: response.message || 'Registration failed' };
  };

  const signOut = async () => {
    authAPI.logout();
    setUser(null);
  };

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    setLoading(true);

    return new Promise((resolve) => {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (tokenResponse: any) => {
            try {
              const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/auth/google`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: tokenResponse.access_token }),
                }
              );

              const data = await res.json();

              if (data.token && data.user) {
                // SAVE TO LOCAL STORAGE INSTEAD OF authAPI.storeUser/storeToken
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setUser(data.user);
                setLoading(false);

                resolve({ error: null });
                return;
              }

              setLoading(false);
              resolve({ error: 'Invalid backend response' });
            } catch (error) {
              console.error('Google backend login error:', error);
              setLoading(false);
              resolve({ error });
            }
          },
        });

        client.requestAccessToken();
      } catch (error) {
        console.error('Google login error:', error);
        setLoading(false);
        resolve({ error });
      }
    });
  };

  const resetPassword = async (email: string) => {
    const response = await authAPI.forgotPassword({ email });

    if (response.success) {
      return { error: null };
    }

    return { error: response.message || 'Failed to send reset email' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
