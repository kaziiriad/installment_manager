
import React from 'react';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Installment } from '@/types';

interface ActiveInstallmentsProps {
  installments: Installment[];
  onMakePayment: (installmentId: string) => void;
}

export const ActiveInstallments: React.FC<ActiveInstallmentsProps> = ({
  installments,
  onMakePayment,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (installment: Installment) => {
    return installment.status === 'overdue';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Active Installments</h2>
      
      {installments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">You don't have any active installments.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = '/products'}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {installments.map((installment) => (
            <Card key={installment.id} className={isOverdue(installment) ? 'border-red-300' : undefined}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {installment.productName}
                      {isOverdue(installment) && (
                        <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Started on {formatDate(installment.startDate)} • {installment.installmentPeriod} months
                    </CardDescription>
                  </div>
                  {getStatusBadge(installment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={installment.productImage}
                        alt={installment.productName}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-3 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Payment Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {installment.progress}%
                        </span>
                      </div>
                      <Progress value={installment.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                        <div className="text-sm font-semibold">{formatCurrency(installment.totalAmount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Remaining</div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(installment.remainingAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-gray-500">Next Payment: </span>
                        <span className={`font-medium ${isOverdue(installment) ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(installment.nextPaymentDate)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant={isOverdue(installment) ? 'destructive' : 'default'}
                      className={isOverdue(installment) ? '' : 'bg-brand-600 hover:bg-brand-700'}
                      onClick={() => onMakePayment(installment.id)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isOverdue(installment) ? 'Pay Overdue' : 'Make Payment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
