import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActiveInstallments } from '@/components/dashboard/ActiveInstallments';
import { PaymentHistory } from '@/components/dashboard/PaymentHistory';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomerDashboardAPI } from '@/services/api';
import { InstallmentResponse, PaymentResponse, PaymentCreateRequest } from '@/types/index.ts';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [installments, setInstallments] = useState<InstallmentResponse[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentResponse[]>([]);
  const [stats, setStats] = useState<{
    totalActiveInstallments: number;
    totalDueAmount: number;
    paymentsReceivedThisMonth: number;
    overduePayments: number;
  }>({
    totalActiveInstallments: 0,
    totalDueAmount: 0,
    paymentsReceivedThisMonth: 0,
    overduePayments: 0,
  });
  const [loading, setLoading] = useState(true);

  // Function to transform installment data from API to frontend model
  const transformInstallmentData = (data: InstallmentResponse[]): InstallmentResponse[] => {
    return data.map(item => ({
      id: item.id.toString(),
      productId: item.product_id.toString(),
      productName: `Product #${item.product_id}`, // You might want to fetch product details separately
      productImage: 'https://placehold.co/600x400?text=Product',
      customerId: user?.id || '',
      customerName: user?.name || 'Customer',
      totalAmount: item.total_amount,
      remainingAmount: item.remaining_amount,
      installmentPeriod: 12, // Default value, adjust as needed
      monthlyAmount: Math.ceil(item.total_amount / 12), // Calculate monthly amount if not provided
      startDate: new Date().toISOString(), // Default to current date if not provided
      nextPaymentDate: item.due_date,
      status: new Date(item.due_date) < new Date() ? 'overdue' : 'active',
      progress: Math.round(((item.total_amount - item.remaining_amount) / item.total_amount) * 100),
    }));
  };

  // Function to transform payment history data from API to frontend model
  const transformPaymentData = (data: PaymentResponse[]): PaymentResponse[] => {
    return data.map(payment => ({
      ...payment,
      id: payment.id.toString(),
      installment_id: payment.installment_id.toString(),
      payment_date: payment.payment_date,
    }));
  };

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch installments using the DashboardAPI
      const installmentsData = await DashboardAPI.getInstallments();
      const transformedInstallments = transformInstallmentData(installmentsData);
      setInstallments(transformedInstallments);
      
      // Fetch payment history using the DashboardAPI
      const paymentsData = await DashboardAPI.getPaymentHistory();
      const transformedPayments = transformPaymentData(paymentsData);
      setPaymentHistory(transformedPayments);
      
      // Calculate dashboard stats based on the fetched data
      const activeInstallments = transformedInstallments.length;
      const totalDue = transformedInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);
      const overdueCount = transformedInstallments.filter(inst => inst.status === 'overdue').length;
      
      // Calculate payments received this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const paymentsThisMonth = transformedPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      const paymentsReceivedThisMonth = paymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
      
      setStats({
        totalActiveInstallments: activeInstallments,
        totalDueAmount: totalDue,
        paymentsReceivedThisMonth: paymentsReceivedThisMonth,
        overduePayments: overdueCount,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again later.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not a customer
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      navigate('/admin/dashboard');
      return;
    }

    // Fetch data from API
    fetchDashboardData();
  }, [user, navigate]);

  const handleMakePayment = async (installmentId: number) => {
    try {
      // Find the installment to get the amount
      const installment = installments.find(inst => inst.id === installmentId);
      if (!installment) {
        toast({
          title: 'Error',
          description: 'Installment not found',
          variant: 'destructive',
        });
        return;
      }

      // Make payment using the API
      await DashboardAPI.makePayment(
        installmentId,
        installment.monthlyAmount,
        'credit_card' // Default payment method
      );

      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully.',
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error making payment:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get upcoming payments from installments
  const getUpcomingPayments = () => {
    const today = new Date();
    return installments
      .filter(inst => new Date(inst.nextPaymentDate) > today)
      .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
      .slice(0, 3);
  };

  // Handle refresh data
  const handleRefreshData = () => {
    fetchDashboardData();
    toast({
      title: 'Refreshing Data',
      description: 'Dashboard data is being updated...',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page-container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
          <Button variant="outline" onClick={handleRefreshData}>
            Refresh Data
          </Button>
        </div>
        
        {/* Dashboard stats */}
        <DashboardStats stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Upcoming payments */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Payments</CardTitle>
              <CardDescription>Your next scheduled payments</CardDescription>
            </CardHeader>
            <CardContent>
              {getUpcomingPayments().length > 0 ? (
                <div className="space-y-4">
                  {getUpcomingPayments().map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={payment.productImage} 
                            alt={payment.productName} 
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{payment.productName}</div>
                          <div className="text-xs text-gray-500">
                            <span>Due: </span>
                            <span>{formatDate(payment.nextPaymentDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'BDT',
                          maximumFractionDigits: 0,
                        }).format(payment.monthlyAmount)}
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate('/payments-calendar')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    View Payment Calendar
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming payments</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick actions */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/products')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Browse Available Products
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/payments-calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Payment Calendar
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/profile')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Methods
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate('/help')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Get Support
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent activity */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates on your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.slice(0, 3).map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {payment.status === 'success'
                          ? 'Payment Successful'
                          : payment.status === 'pending'
                          ? 'Payment Processing'
                          : 'Payment Failed'}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(payment.date)}</div>
                    </div>
                    <div className={`text-sm font-medium ${
                      payment.status === 'success'
                        ? 'text-green-600'
                        : payment.status === 'pending'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                        maximumFractionDigits: 0,
                      }).format(payment.amount)}
                    </div>
                  </div>
                ))}
                
                {paymentHistory.length > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => document.getElementById('payment-history')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View All Activity
                  </Button>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Active installments */}
        <div className="mb-8">
          <ActiveInstallments
            installments={installments}
            onMakePayment={handleMakePayment}
          />
        </div>
        
        {/* Payment history */}
        <div id="payment-history">
          <PaymentHistory payments={paymentHistory} />
        </div>
      </main>
      <Footer />
    </>
  );
};
