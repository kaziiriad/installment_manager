
export type UserRole = 'admin' | 'customer';
export type ReportType = 'all' | 'weekly' | 'monthly' 

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
}

export interface Product {
  id: number; // Changed from string to number to match backend
  name: string;
  price_in_bdt: number; // Changed to match backend response
  // Optional frontend-only fields
  description?: string;
  category?: string;
  brand?: string;
  images?: string[];
  installmentAvailable?: boolean;
}

export interface Installment {
  id: number;
  product_id: number;
  total_amount_in_bdt: number; // Using the property returned by backend
  installment_amount_in_bdt: number | null;
  remaining_amount_in_bdt: number; // Using the property returned by backend
  due_date: string; // ISO date string
  // Optional fields that might not be in all responses
  user_id?: number;
  created_at?: string; // ISO datetime string
  next_due_date?: string | null;
}

export interface Payment {
  id: number;
  installment_id: number;
  amount_in_bdt: number; // Using the property returned by backend
  payment_date: string; // ISO datetime string
}

// Request/Response types to match backend schemas

export interface UserRegisterRequest {
  email: string;
  password: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PaymentCreateRequest {
  amount_in_bdt: number; // Changed to match backend schema
  installment_id: number;
}

export interface PaymentResponse {
  id: number;
  installment_id: number;
  amount_in_bdt: number; // Changed to match backend schema
  payment_date: string; // ISO date string
}


export interface InstallmentCreateRequest {
  product_id: number;
  initial_payment?: number; // Optional initial payment in BDT
  period_of_installment: number; // Number of months (1-12)
  due_day: number; // Day of month (1-31)
}

export interface InstallmentResponse {
  id: number;
  total_amount: number; // Amount in BDT
  remaining_amount: number; // Amount in BDT
  due_date: string; // ISO date string
  product_id: number;
}

// Pagination types to match backend responses
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Removed PaginatedPaymentResponse as it is equivalent to PaginatedResponse<PaymentResponse>

// Removed PaginatedInstallmentResponse as it is equivalent to PaginatedResponse<InstallmentResponse>

// Report types

export interface CustomType {
  id: number;
  amount: number;
  payment_date: string
  installment_id: number;
  user_name: string;
  user_email: string;
}

export interface ReportResponse {
  report_type: string;
  start_date: string;
  end_date: string;
  total_paid: number;
  total_due: number;
  year?: number;
  period?: ReportType;
  payments: CustomType[];
  pagination : PaginationInfo;
}

export interface PaymentDetail {
  id: number;
  amount: number;
  payment_date: string;
  installment_id: number;
  user_name: string;
  user_email: string;
}


// Helper types for API responses
export interface ApiError {
  detail: string;
}

// Frontend derived data types
export interface InstallmentWithDetails extends InstallmentResponse {
  product?: Product;
  payments?: Payment[];
  status: 'active' | 'completed' | 'overdue' | 'pending';
  progress: number; // Calculated percentage of payment completion
}

export interface DashboardStats {
  totalActiveInstallments: number;
  totalDueAmount: number;
  paymentsReceivedThisMonth: number;
  overduePayments: number;
}
