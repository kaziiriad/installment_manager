
import React, { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface InstallmentCreateRequest {
  product_id: number;
  initial_payment: number;
  period_of_installment: number;
  due_day: number;
}

interface InstallmentCalculatorProps {
  productId: number;
  productPrice: number;
  onProceed?: (plan: InstallmentCreateRequest) => void;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  productId,
  productPrice,
  onProceed,
}) => {
  const [periodOfInstallment, setPeriodOfInstallment] = useState(3);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [initialPayment, setInitialPayment] = useState(0);
  const [dueDay, setDueDay] = useState(15); // Default to 15th of the month
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

  // Generate array of days 1-28 for due day selection
  const dueDays = Array.from({ length: 28 }, (_, i) => i + 1);

  // Calculate installment details
  useEffect(() => {
    // Calculate down payment amount
    const downPaymentAmount = (productPrice * downPaymentPercent) / 100;
    
    // Calculate remaining amount
    const remainingAmount = productPrice - downPaymentAmount;
    
    // Calculate monthly payment (no interest)
    const monthlyPayment = remainingAmount / periodOfInstallment;
    
    setInitialPayment(downPaymentAmount);
    setMonthlyAmount(monthlyPayment);
    setTotalAmount(productPrice); // Total is just the product price (no interest)
  }, [productPrice, periodOfInstallment, downPaymentPercent]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProceed = () => {
    // Create the installment request object that matches the backend schema
    const installmentRequest: InstallmentCreateRequest = {
      product_id: productId,
      initial_payment: initialPayment,
      period_of_installment: periodOfInstallment,
      due_day: dueDay
    };

    if (onProceed) {
      onProceed(installmentRequest);
    } else {
      toast({
        title: 'Installment Plan Selected',
        description: `${periodOfInstallment} months plan with ${formatCurrency(initialPayment)} down payment, due on day ${dueDay} of each month`,
      });
    }
  };

  // Helper function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Installment Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installment Period
            </label>
            <Select
              value={String(periodOfInstallment)}
              onValueChange={(value) => setPeriodOfInstallment(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="9">9 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Down Payment ({downPaymentPercent}%)
              </label>
              <span className="text-sm font-medium text-brand-600">
                {formatCurrency(initialPayment)}
              </span>
            </div>
            <Slider
              value={[downPaymentPercent]}
              min={10}
              max={50}
              step={5}
              onValueChange={(value) => setDownPaymentPercent(value[0])}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>10%</span>
              <span>30%</span>
              <span>50%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Due Date
            </label>
            <Select
              value={String(dueDay)}
              onValueChange={(value) => setDueDay(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select due day" />
              </SelectTrigger>
              <SelectContent>
                {dueDays.map(day => (
                  <SelectItem key={day} value={String(day)}>
                    {day}{getOrdinalSuffix(day)} of each month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payment:</span>
              <span className="text-sm font-medium">{formatCurrency(monthlyAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Initial Payment:</span>
              <span className="text-sm font-medium">{formatCurrency(initialPayment)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-sm font-medium text-gray-800">Total Amount:</span>
              <span className="text-sm font-medium text-brand-700">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>
                First payment due on the {dueDay}{getOrdinalSuffix(dueDay)} of next month
              </span>
            </div>
          </div>

          <Button 
            onClick={handleProceed}
            className="w-full bg-brand-600 hover:bg-brand-700"
          >
            Proceed with This Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
