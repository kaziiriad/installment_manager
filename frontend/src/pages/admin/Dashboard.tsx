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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Layout } from '@/components/layout/Layout';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Admin Dashboard mounted, user:', user, 'authLoading:', authLoading);
    console.log('Token in localStorage:', localStorage.getItem('token'));
    
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('Auth is still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('No user, redirecting to login');
      // Add a small delay to ensure auth has fully loaded
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
        }
      }, 100);
      return;
    }

    if (user.role?.toUpperCase() !== 'ADMIN') {
      console.log('User is not admin, role:', user.role);
      navigate('/dashboard');
      return;
    }

    console.log('User is admin, showing dashboard');
  }, [user, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Also show loading while we're checking auth
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
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
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳0</div>
                <p className="text-xs text-muted-foreground">Total collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳0</div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
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
                Admin dashboard is loading. API integration is in progress.
              </p>
            </CardContent>
          </Card>
      </div>
    </Layout>
  );
};