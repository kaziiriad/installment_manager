import axios from 'axios';
import { InstallmentResponse, PaymentResponse, PaymentCreateRequest, ReportResponse, User, PaginatedResponse, ReportType } from '@/types';
// Create axios instance with base URL
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}` || 'http://localhost:8000/',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const CustomerDashboardAPI = {
  // Get user installments
  getInstallments: async (): Promise<InstallmentResponse[]> => {
    try {
      const response = await api.get('/installments');
      // Handle paginated response
      if (response.data && response.data.items) {
        return response.data.items;
      }
      // Fallback to direct array if not paginated
      return response.data;
    } catch (error) {
      console.error('Error fetching installments:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get('/payments');
      // Handle paginated response
      if (response.data && response.data.items) {
        return response.data.items;
      }
      // Fallback to direct array if not paginated
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Make a payment
  makePayment: async (installmentId: number, amount: number): Promise<PaymentCreateRequest> => {
    try {
      const response = await api.post('/payments', {
        installment_id: installmentId,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error making payment:', error);
      throw error;
    }
  }
};


export const AdminDashboardAPI = {
  // Get all payments
  customerReport: async (page: number, limit: number, report_type: ReportType): Promise<ReportResponse> => {
    try {
      const response = await api.get(`/admin/reports?report_type=${report_type}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get all customers
  getCustomers: async (page: number, limit: number): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/customers', {
      params: { page, limit }
    });
    return response.data;
  },

};