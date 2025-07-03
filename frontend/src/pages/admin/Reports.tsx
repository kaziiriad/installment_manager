import React, { useState, useEffect } from 'react';
import { AdminDashboardAPI } from '@/services/api';
import { ReportResponse, ReportType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';

const AdminReports: React.FC = () => {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await AdminDashboardAPI.customerReport(page, limit, reportType);
        setReport(response);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
      setLoading(false);
    };

    fetchReport();
  }, [page, limit, reportType]);

  const totalPages = report && report.pagination ? Math.ceil(report.pagination.total / limit) : 0;

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Reports</h1>
          <Select onValueChange={(value) => setReportType(value as ReportType)} defaultValue={reportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          {loading ? (
            <p>Loading...</p>
          ) : report ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Total Paid</h3>
                  <p className="text-2xl">{report.total_paid} BDT</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Due</h3>
                  <p className="text-2xl">{report.total_due} BDT</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.payments && report.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.user_name} ({payment.user_email})</TableCell>
                      <TableCell>{payment.amount} BDT</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span>Page {page} of {totalPages}</span>
                <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p>No report data available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;