
export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number; // Stored in cents in backend
  description?: string;
  category?: string;
  brand?: string;
  images?: string[];
  installmentAvailable?: boolean;
}

export interface Installment {
  id: number;
  user_id: number;
  product_id: number;
  total_amount: number; // Stored in cents in backend
  installment_amount: number | null;
  remaining_amount: number; // Stored in cents in backend
  due_date: string; // ISO date string
  created_at: string; // ISO datetime string
  // Calculated properties from backend
  total_amount_in_bdt: number;
  remaining_amount_in_bdt: number;
  installment_amount_in_bdt: number | null;
  next_due_date: string | null;
}

export interface Payment {
  id: number;
  installment_id: number;
  amount: number; // Stored in cents in backend
  payment_date: string; // ISO datetime string
  amount_in_bdt: number; // Calculated property from backend
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
  amount: number; // Amount in BDT
  installment_id: number;
  
}

export interface PaymentResponse {
  id: number;
  installment_id: number;
  amount: number; // Amount in BDT
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
