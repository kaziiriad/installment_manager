import axios from 'axios';
import { InstallmentResponse, PaymentResponse, PaymentCreateRequest } from '@/types/index.ts';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}` || 'http://localhost:8000/',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
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
      return response.data;
    } catch (error) {
      console.error('Error fetching installments:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get('/payments/');
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