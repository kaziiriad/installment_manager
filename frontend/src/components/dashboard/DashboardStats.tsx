
import React from 'react';
import { ArrowUpRight, ArrowDownRight, CalendarDays, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats as DashboardStatsType } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Active Installments</CardTitle>
          <CreditCard className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalActiveInstallments}</div>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500">Your ongoing payment plans</p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Due Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalDueAmount)}</div>
        </CardContent>
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500">Total remaining payments</p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Payments This Month</CardTitle>
          <CalendarDays className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.paymentsReceivedThisMonth)}</div>
        </CardContent>
        <CardFooter className="pt-0 flex items-center">
          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
          <p className="text-xs text-green-500 font-medium">12.5% from last month</p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Overdue Payments</CardTitle>
          <AlertTriangle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overduePayments}</div>
        </CardContent>
        <CardFooter className="pt-0 flex items-center">
          {stats.overduePayments > 0 ? (
            <>
              <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-red-500 font-medium">Action required</p>
            </>
          ) : (
            <>
              <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500 font-medium">All payments on time</p>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
