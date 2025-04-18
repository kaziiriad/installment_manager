
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 6) strength += 25;
    if (password.length > 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(100, strength);
  };

  // Password validation
  const passwordValidations = [
    { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
    { id: 'uppercase', label: 'At least one uppercase letter', valid: /[A-Z]/.test(password) },
    { id: 'number', label: 'At least one number', valid: /[0-9]/.test(password) },
    { id: 'special', label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(password) },
    { id: 'match', label: 'Passwords match', valid: password === confirmPassword && password !== '' },
  ];

  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        variant: 'destructive',
        title: 'Terms & Conditions',
        description: 'Please accept the terms and conditions to continue.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(email, name, password);
      toast({
        title: 'Registration successful',
        description: 'Please check your email for verification code.',
      });
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorForStrength = (strength: number) => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full"
              />
              {password && (
                <>
                  <div className="mt-2">
                    <Progress value={passwordStrength} className={getColorForStrength(passwordStrength)} />
                    <p className="text-xs mt-1 text-gray-500">
                      Password strength: {passwordStrength < 30 ? 'Weak' : passwordStrength < 60 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordValidations.map((validation) => (
                      <div key={validation.id} className="flex items-center text-xs">
                        {validation.valid ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={validation.valid ? 'text-green-500' : 'text-red-500'}>
                          {validation.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="accept-terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
              I accept the{' '}
              <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-500">
                Terms and Conditions
              </Link>
            </label>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700"
              disabled={isSubmitting || !acceptTerms || password !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
