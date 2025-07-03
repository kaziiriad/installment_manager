import React, { useState, useEffect } from 'react';
import { AdminDashboardAPI } from '@/services/api';
import { User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layout } from '@/components/layout/Layout';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // The backend returns a simple array for customers
        const response = await AdminDashboardAPI.getCustomers(1, 100); // Fetching up to 100 for now
        setCustomers(response || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]); // Ensure customers is an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-8">
        <h1 className="text-2xl font-bold mb-8">Customers</h1>
        <div className="bg-white shadow rounded-lg p-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.is_verified ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No customers found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminCustomers;