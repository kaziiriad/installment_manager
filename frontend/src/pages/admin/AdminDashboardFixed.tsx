import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Layout } from '@/components/layout/Layout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AdminDashboardFixed: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    if (token) {
      // Fetch customer count
      axios.get(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setCustomerCount(response.data.length);
      }).catch(error => {
        console.error('Error fetching customers:', error);
      });

      // Fetch reports data
      axios.get(`${API_URL}/admin/reports?report_type=all`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setTotalRevenue(response.data.total_paid);
        setPendingPayments(response.data.total_due);
      }).catch(error => {
        console.error('Error fetching reports:', error);
      });
    }
  }, [token]);

  // Wait for auth to load
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user exists and is admin
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    // Don't redirect immediately, show a message
    return (
      <Layout>
        <div className="container mx-auto p-4 pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You need admin privileges to access this page.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
              >
                {user ? 'Go to Dashboard' : 'Go to Login'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-8">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerCount}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/reports')}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Simple message */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Welcome, {user.email}! Your role is: {user.role}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboardFixed;