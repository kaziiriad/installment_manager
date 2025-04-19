import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InstallmentResponse } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CreditCardIcon, SmartphoneIcon, BankIcon } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: InstallmentResponse | null;
  onSubmit: (installmentId: number, amount: number, paymentMethod: string) => Promise<void>;
  isSubmitting: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  installment,
  onSubmit,
  isSubmitting,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  // Reset form when modal opens with new installment
  React.useEffect(() => {
    if (installment) {
      // Default to the remaining amount or next installment amount
      const suggestedAmount = Math.min(
        installment.remaining_amount,
        installment.monthly_amount
      );
      setAmount(suggestedAmount);
    }
  }, [installment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (installment && amount > 0) {
      await onSubmit(installment.installment_id, amount, paymentMethod);
    }
  };

  if (!installment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Pay for your installment for {installment.product_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">{formatCurrency(installment.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount Paid:</span>
              <span className="font-medium">{formatCurrency(installment.amount_paid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining Amount:</span>
              <span className="font-medium text-primary">{formatCurrency(installment.remaining_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Monthly Installment:</span>
              <span className="font-medium">{formatCurrency(installment.monthly_amount)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={installment.remaining_amount}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter an amount between 1 and {formatCurrency(installment.remaining_amount)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card" className="flex items-center">
                    <div className="flex items-center">
                      <CreditCardIcon className="mr-2 h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile_banking">
                    <div className="flex items-center">
                      <SmartphoneIcon className="mr-2 h-4 w-4" />
                      Mobile Banking
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center">
                      <BankIcon className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || amount <= 0 || amount > installment.remaining_amount}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;