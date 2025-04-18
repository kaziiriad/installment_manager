
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/context/AuthContext';
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
import { Installment } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Mock data
const MOCK_STATS = {
  totalActiveInstallments: 245,
  totalDueAmount: 12540000,
  paymentsReceivedThisMonth: 2430000,
  overduePayments: 15,
  customers: 180,
  products: 72,
  revenue: {
    current: 2430000,
    previous: 1950000,
    percentChange: 24.6,
  },
};

const MOCK_RECENT_INSTALLMENTS: Installment[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Samsung Galaxy S23 Ultra',
    productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2942&auto=format&fit=crop',
    customerId: '2',
    customerName: 'Jane Customer',
    totalAmount: 189999,
    remainingAmount: 142499,
    installmentPeriod: 12,
    monthlyAmount: 13334,
    startDate: '2023-09-15',
    nextPaymentDate: '2023-11-15',
    status: 'active',
    progress: 25,
  },
  {
    id: '2',
    productId: '3',
    productName: 'Dell XPS 15',
    productImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2940&auto=format&fit=crop',
    customerId: '3',
    customerName: 'Michael Johnson',
    totalAmount: 249999,
    remainingAmount: 249999,
    installmentPeriod: 12,
    monthlyAmount: 20833,
    startDate: '2023-10-20',
    nextPaymentDate: '2023-10-10',
    status: 'overdue',
    progress: 0,
  },
  {
    id: '3',
    productId: '2',
    productName: 'iPhone 15 Pro Max',
    productImage: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=2880&auto=format&fit=crop',
    customerId: '4',
    customerName: 'Sarah Williams',
    totalAmount: 209999,
    remainingAmount: 157499,
    installmentPeriod: 6,
    monthlyAmount: 26250,
    startDate: '2023-10-05',
    nextPaymentDate: '2023-11-05',
    status: 'active',
    progress: 25,
  },
  {
    id: '4',
    productId: '5',
    productName: 'Sony Alpha A7 IV',
    productImage: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2851&auto=format&fit=crop',
    customerId: '5',
    customerName: 'Robert Brown',
    totalAmount: 279999,
    remainingAmount: 279999,
    installmentPeriod: 9,
    monthlyAmount: 31111,
    startDate: '2023-10-25',
    nextPaymentDate: '2023-10-15',
    status: 'pending',
    progress: 0,
  },
  {
    id: '5',
    productId: '7',
    productName: 'LG OLED C2 65"',
    productImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2940&auto=format&fit=crop',
    customerId: '6',
    customerName: 'Emily Davis',
    totalAmount: 299999,
    remainingAmount: 149999,
    installmentPeriod: 12,
    monthlyAmount: 25000,
    startDate: '2023-09-01',
    nextPaymentDate: '2023-11-01',
    status: 'active',
    progress: 50,
  },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentInstallments, setRecentInstallments] = useState<Installment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    // Simulate API call to fetch data
    setTimeout(() => {
      setRecentInstallments(MOCK_RECENT_INSTALLMENTS);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

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

  // Filter installments based on search term and status filter
  const filteredInstallments = recentInstallments.filter((installment) => {
    const matchesSearch = 
      searchTerm === '' || 
      installment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      installment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  // Handle view installment details
  const handleViewInstallment = (id: string) => {
    toast({
      title: 'Viewing Installment',
      description: `Viewing details for installment #${id}`,
    });
    // In a real app, this would navigate to the installment details page
  };

  // Handle approve installment
  const handleApproveInstallment = (id: string) => {
    toast({
      title: 'Installment Approved',
      description: `Installment #${id} has been approved`,
    });
    
    // Update local state to reflect the change
    setRecentInstallments((prev) =>
      prev.map((installment) => 
        installment.id === id 
          ? { ...installment, status: 'active' } 
          : installment
      )
    );
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-72 bg-gray-200 rounded"></div>
              <div className="h-72 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Installments</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActiveInstallments}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active payment plans</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Due Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalDueAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">Total outstanding balance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue This Month</CardTitle>
              <LineChart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.revenue.current)}</div>
              <div className="flex items-center text-xs mt-1">
                {stats.revenue.percentChange > 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">
                      {stats.revenue.percentChange}% from last month
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-red-500 font-medium">
                      {Math.abs(stats.revenue.percentChange)}% from last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Overdue Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overduePayments}</div>
              <p className="text-xs text-red-500 mt-1 font-medium">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center text-gray-500">
                  <BarChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Revenue chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 border rounded-lg p-3 text-center">
                      <Users className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <div className="text-2xl font-bold">{stats.customers}</div>
                      <div className="text-xs text-gray-500">Total Customers</div>
                    </div>
                    <div className="space-y-1 border rounded-lg p-3 text-center">
                      <ShoppingBag className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <div className="text-2xl font-bold">{stats.products}</div>
                      <div className="text-xs text-gray-500">Total Products</div>
                    </div>
                    <div className="space-y-1 border rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <div className="text-2xl font-bold">16</div>
                      <div className="text-xs text-gray-500">New Applications</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium">Product Categories</div>
                      <div className="text-xs text-gray-500">Sales Distribution</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Smartphones</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Laptops</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>TVs</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Cameras</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="customers">
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div className="flex justify-between font-medium">
                        <span>New Customer Growth</span>
                        <span className="text-green-600">+12%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        23 new customers this month
                      </div>
                    </div>
                    
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
                      <div className="text-center text-gray-500">
                        <LineChart className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs">Customer growth chart</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-2">Top Customers</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>Emily Davis</span>
                          <span className="font-medium">{formatCurrency(299999)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>Robert Brown</span>
                          <span className="font-medium">{formatCurrency(279999)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>Michael Johnson</span>
                          <span className="font-medium">{formatCurrency(249999)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="products">
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div className="flex justify-between font-medium">
                        <span>Product Performance</span>
                        <span className="text-green-600">22 active</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        5 new products added this month
                      </div>
                    </div>
                    
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
                      <div className="text-center text-gray-500">
                        <BarChart className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs">Product performance chart</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-2">Top Products</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>iPhone 15 Pro Max</span>
                          <span className="font-medium">32 units</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>Samsung Galaxy S23 Ultra</span>
                          <span className="font-medium">28 units</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                          <span>MacBook Pro 16</span>
                          <span className="font-medium">19 units</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent installments */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-lg">Recent Installment Applications</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search installments..."
                    className="pl-8 max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" title="Export Data">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstallments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        No installments found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell className="font-medium">#{installment.id}</TableCell>
                        <TableCell>{installment.customerName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{installment.productName}</TableCell>
                        <TableCell>{formatCurrency(installment.totalAmount)}</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{installment.progress}%</span>
                              <span>{formatCurrency(installment.totalAmount - installment.remainingAmount)}</span>
                            </div>
                            <Progress value={installment.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(installment.status)}</TableCell>
                        <TableCell>{formatDate(installment.nextPaymentDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleViewInstallment(installment.id)}
                            >
                              View
                            </Button>
                            
                            {installment.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-green-600 hover:text-green-700"
                                onClick={() => handleApproveInstallment(installment.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div>Showing {filteredInstallments.length} of {recentInstallments.length} installments</div>
              <Button variant="outline" size="sm">
                View All Installments
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            className="h-auto py-6 flex flex-col items-center justify-center bg-brand-600 hover:bg-brand-700"
            onClick={() => navigate('/admin/installments')}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span className="text-sm">Manage Installments</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex flex-col items-center justify-center bg-brand-600 hover:bg-brand-700"
            onClick={() => navigate('/admin/customers')}
          >
            <Users className="h-6 w-6 mb-2" />
            <span className="text-sm">Manage Customers</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex flex-col items-center justify-center bg-brand-600 hover:bg-brand-700"
            onClick={() => navigate('/admin/products')}
          >
            <ShoppingBag className="h-6 w-6 mb-2" />
            <span className="text-sm">Manage Products</span>
          </Button>
          
          <Button 
            className="h-auto py-6 flex flex-col items-center justify-center bg-brand-600 hover:bg-brand-700"
            onClick={() => navigate('/admin/reports')}
          >
            <BarChart className="h-6 w-6 mb-2" />
            <span className="text-sm">Generate Reports</span>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};
