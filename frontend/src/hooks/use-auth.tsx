import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { User, TokenResponse } from '@/types';
import { useToast } from './use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Auth Provider: Checking authentication...');
      const storedToken = localStorage.getItem('token');
      console.log('Auth Provider: Token from localStorage:', storedToken ? 'Found' : 'Not found');
      
      if (storedToken) {
        try {
          console.log('Auth Provider: Fetching user data from /auth/me');
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          console.log('Auth Provider: User data received:', response.data);
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth Provider: Error fetching user data:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('Auth Provider: No token found, user is not logged in');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<TokenResponse>(`${API_URL}/auth/login`, {
        username: email,
        password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

    );

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);

      // Fetch user data
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      setUser(userResponse.data);

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });

      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.detail || 'Login failed. Please check your credentials.' : 'Login failed. Please check your credentials.';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      toast({
        title: 'Registration Successful',
        description: 'Please check your email for the OTP to verify your account.',
      });

      localStorage.setItem('email verification pending', email);

      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.detail || 'Registration failed. Please try again.' : 'Registration failed. Please try again.';
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Verify OTP function
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp
      },
    );

      toast({
        title: 'Verification Successful',
        description: 'Your account has been verified. You can now log in.',
      });
      localStorage.removeItem('email verification pending');
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.detail || 'Verification failed. Please try again.' : 'Verification failed. Please try again.';
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };

  // resend OTP function
  const resendOTP = async (): Promise<boolean> => {
    try {
      const email = localStorage.getItem('email verification pending');
      if (!email) {
        toast({
          title: 'No Email Found',
          description: 'No email found for OTP resend.',  });
        return false;
      }
      await axios.post(`${API_URL}/auth/resend-otp?email=${email}`
    );
      toast({
        title: 'OTP Resent',
        description: 'A new OTP has been sent to your email.',
      });
      return true;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.detail || 'Failed to resend OTP. Please try again.' : 'Failed to resend OTP. Please try again.';
      toast({
        title: 'Resend OTP Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  };


  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP
  };

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};