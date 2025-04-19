
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';

import { 
  BarChart, 
  LineChart, 
  Calendar, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import { AdminDashboardAPI } from '@/services/api';
import { ReportResponse, User, ReportType } from '@/types/index.ts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  // const [stats, setStats] = useState();
  // const [recentInstallments, setRecentInstallments] = useState([]);
  // const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('all');
  
  // Customer report state
  const [customerReport, setCustomerReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('all');
  const [reportPage, setReportPage] = useState(1);
  const [reportLimit] = useState(5);
  
  // Customer pagination state
  const [customerPage, setCustomerPage] = useState(1);
  const [customertLimit] = useState(5);
  // Customers state
  const [customers, setCustomers] = useState<User[]>([]);
  const [customerLoading, setCustomerLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
  
      if (user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
  
      try {
        // Load both datasets simultaneously
        await Promise.all([
          AdminDashboardAPI.customerReport(reportPage, reportLimit, reportType),
          AdminDashboardAPI.getCustomers(customerPage, customertLimit)
        ]);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
  
    checkAuthAndLoadData();
  }, [user, navigate]);


  // Fetch customer report data
useEffect(() => {
  const fetchCustomerReport = async () => {
    try {
      setReportLoading(true);
      const data = await AdminDashboardAPI.customerReport(reportPage, reportLimit, reportType);
      setCustomerReport(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load report' });
    } finally {
      setReportLoading(false);
    }
  };

  if (user?.role === 'admin') {
    fetchCustomerReport();
  }
}, [reportType, reportPage]);


  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setCustomerLoading(true);
        const data = await AdminDashboardAPI.getCustomers(customerPage, customertLimit);
        // Make sure API returns PaginatedResponse<User>
        setCustomers(data.items); // Access the items property
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load customers' });
      } finally {
        setCustomerLoading(false);
      }
    };
  
    if (user?.role === 'admin') {
      fetchCustomers();
    }
  }, [customerPage]);
  

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
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


  // Handle report type change
  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value);
    setReportPage(1); // Reset to first page when changing report type
  };

  // Handle pagination
  const handleNextReportPage = () => {
    if (reportPage < customerReport.pagination.pages) {
      setReportPage(reportPage + 1);
    }
  };

  const handlePrevReportPage = () => {
    if (reportPage > 1) {
      setReportPage(reportPage - 1);
    }
  };

  // Handle customer pagination
  const handleNextCustomerPage = () => {
    if (customerPage < customers.length / customertLimit) {
      setCustomerPage(customerPage + 1);
    }
  };
  const handlePrevCustomerPage = () => {
    if (customerPage > 1) {
      setCustomerPage(customerPage - 1);
    }
  };
  // Handle search term change

  // Handle status filter change
  // const handleStatusFilterChange = (value: ReportType) => {
  //   setStatusFilter(value);
  // };

  if (loading || reportLoading || customerLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar>
        <main className="container mx-auto p-4 pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={handleReportTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerReport?.pagination.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(customerReport?.total_paid || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(customerReport?.total_due || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Installments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerReport?.payments?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Replace with your chart implementation */}
                <div className="flex items-center justify-center h-full bg-muted/50 rounded">
                  <span className="text-muted-foreground">Chart Placeholder</span>
                  <Bar
                      data={{
                        labels: ['Paid', 'Due'],
                        datasets: [{
                          label: 'Amount',
                          data: [customerReport?.total_paid || 0, customerReport?.total_due || 0],
                          backgroundColor: ['#4F46E5', '#EF4444']
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}
                    />

                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerReport?.payments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.user_name}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer List</CardTitle>
              <Input 
                placeholder="Search customers..." 
                className="max-w-[300px]"
                // Add search functionality
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge variant={customer.is_verified ? 'default' : 'secondary'}>
                        {customer.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge('active')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((customerPage - 1) * customertLimit) + 1} to{' '}
              {Math.min(customerPage * customertLimit, customers.length)} of{' '}
              {customers.length} customers
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrevCustomerPage}
                disabled={customerPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNextCustomerPage}
                disabled={customerPage * customertLimit >= customers.length}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
        </main>
        <Footer />
      </Navbar>
    </div>
  );
};
