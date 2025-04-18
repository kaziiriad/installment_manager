
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

interface InstallmentCalculatorProps {
  productPrice: number;
  onProceed?: (plan: {
    months: number;
    downPayment: number;
    monthlyAmount: number;
    totalAmount: number;
  }) => void;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  productPrice,
  onProceed,
}) => {
  const [months, setMonths] = useState(3);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [downPayment, setDownPayment] = useState(0);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

  // Interest rates based on installment period
  const getInterestRate = (months: number) => {
    switch (months) {
      case 3: return 5;
      case 6: return 8;
      case 9: return 10;
      case 12: return 12;
      default: return 5;
    }
  };

  // Calculate installment details
  useEffect(() => {
    const interestRate = getInterestRate(months);
    const downPaymentAmount = (productPrice * downPaymentPercent) / 100;
    const remainingAmount = productPrice - downPaymentAmount;
    const interest = (remainingAmount * interestRate) / 100;
    const totalPayable = remainingAmount + interest;
    const monthlyPayment = totalPayable / months;
    
    setDownPayment(downPaymentAmount);
    setMonthlyAmount(monthlyPayment);
    setTotalAmount(downPaymentAmount + totalPayable);
  }, [productPrice, months, downPaymentPercent]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProceed = () => {
    if (onProceed) {
      onProceed({
        months,
        downPayment,
        monthlyAmount,
        totalAmount,
      });
    } else {
      toast({
        title: 'Installment Plan Selected',
        description: `${months} months plan with ${formatCurrency(downPayment)} down payment`,
      });
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
              value={String(months)}
              onValueChange={(value) => setMonths(Number(value))}
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
                {formatCurrency(downPayment)}
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

          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interest Rate:</span>
              <span className="text-sm font-medium">{getInterestRate(months)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payment:</span>
              <span className="text-sm font-medium">{formatCurrency(monthlyAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Down Payment:</span>
              <span className="text-sm font-medium">{formatCurrency(downPayment)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-sm font-medium text-gray-800">Total Amount:</span>
              <span className="text-sm font-medium text-brand-700">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>
                First payment due after approval
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
