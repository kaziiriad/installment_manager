
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const OtpVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP } = useAuth();
  const { resendOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Countdown timer for OTP expiration
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP code.",
      });
      return;
    }

    setIsSubmitting(true);

    const success = await verifyOTP(email, otp);

    if (success) {
      navigate("/login");
    }

    setIsSubmitting(false);
  };

  const handleResendOtp = () => {
    setCanResend(false);
    setTimeLeft(60);
    
    resendOTP();
    toast({
      title: 'OTP Resent',
      description: 'A new verification code has been sent to your email.',
    });
    
    // Reset the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Handle OTP input change
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 flex flex-col items-center">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <InputOTP
                id="otp"
                name="otp"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center text-sm">
              {timeLeft > 0 ? (
                <p className="text-gray-500">
                  Resend code in <span className="font-medium">{timeLeft}</span> seconds
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className="p-0 text-brand-600 hover:text-brand-500"
                >
                  Resend verification code
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Please check your email inbox and spam folder for the verification code.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
