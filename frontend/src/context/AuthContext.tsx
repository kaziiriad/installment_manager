
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  verifyOtp: async () => {},
  logout: () => {},
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
});

// Mock user data for demonstration purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    password: 'password123',
    verified: true,
  },
  {
    id: '2',
    name: 'Jane Customer',
    email: 'customer@example.com',
    role: 'customer' as UserRole,
    password: 'password123',
    verified: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from session storage)
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email and password
      const matchedUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!matchedUser) {
        throw new Error('Invalid email or password');
      }
      
      if (!matchedUser.verified) {
        throw new Error('Please verify your account first');
      }
      
      // Extract password before storing
      const { password: _, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      
      // Store user in session storage
      sessionStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user with this email already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // In a real app, you would create a new user in your backend
      console.log('Registered new user:', { email, name });
      
      // Registration successful, but user needs to verify OTP
      return;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify OTP with your backend
      console.log('Verified OTP for:', email, otp);
      
      // OTP verified successfully
      return;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (!existingUser) {
        throw new Error('No user found with this email');
      }
      
      // In a real app, you would send a password reset email
      console.log('Password reset requested for:', email);
      
      return;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify token and update password
      console.log('Password reset for token:', token);
      
      return;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    verifyOtp,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
