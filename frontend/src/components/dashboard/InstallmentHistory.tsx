import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InstallmentResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CalendarIcon, CreditCardIcon, AlertCircleIcon } from 'lucide-react';

interface InstallmentHistoryProps {
  installments: InstallmentResponse[];
  isLoading: boolean;
  onMakePayment: (installmentId: number) => void;
}

const InstallmentHistory: React.FC<InstallmentHistoryProps> = ({
  installments,
  isLoading,
  onMakePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter installments based on search term and status filter
  const filteredInstallments = installments.filter((installment) => {
    const matchesSearch =
      installment.installment_id.toString().includes(searchTerm) ||
      installment.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' || installment.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate progress percentage
  const calculateProgress = (paid: number, total: number) => {
    return Math.min(Math.round((paid / total) * 100), 100);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'upcoming':
        return <Badge className="bg-purple-500">Upcoming</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Installment History</CardTitle>
        <CardDescription>
          Track your installment plans and upcoming payments
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search by ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredInstallments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'No installments match your filters'
              : 'No installment history available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of your installment plans</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((installment) => {
                  const progressPercent = calculateProgress(
                    installment.amount_paid,
                    installment.total_amount
                  );
                  
                  return (
                    <TableRow key={installment.installment_id}>
                      <TableCell className="font-medium">
                        #{installment.installment_id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{installment.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(installment.total_amount)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(installment.start_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {installment.status.toLowerCase() === 'completed' ? (
                            <span className="text-green-500">Completed</span>
                          ) : (
                            <>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDate(installment.next_payment_date)}
                              {installment.status.toLowerCase() === 'overdue' && (
                                <AlertCircleIcon className="ml-2 h-4 w-4 text-red-500" />
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{formatCurrency(installment.amount_paid)}</span>
                            <span>{formatCurrency(installment.total_amount)}</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <div className="text-xs text-right mt-1">
                            {progressPercent}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMakePayment(installment.installment_id)}
                          disabled={installment.status.toLowerCase() === 'completed'}
                          className="flex items-center"
                        >
                          <CreditCardIcon className="mr-2 h-4 w-4" />
                          Pay Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          Showing {filteredInstallments.length} of {installments.length} installments
        </div>
      </CardFooter>
    </Card>
  );
};

export default InstallmentHistory;