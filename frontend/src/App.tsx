
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { OtpVerification } from "./pages/auth/OtpVerification";
import { ProductListing } from "./pages/products/ProductListing";
import { ProductDetail } from "./pages/products/ProductDetail";
import { InstallmentApplication } from "./pages/installments/InstallmentApplication";
import { CustomerDashboard } from "./pages/customer/Dashboard";
import { AdminDashboard } from "./pages/admin/Dashboard";
import AuthDebug from "./pages/admin/AuthDebug";
import AdminDashboardFixed from "./pages/admin/AdminDashboardFixed";
import AdminCustomers from "./pages/admin/Customers";
import AdminReports from "./pages/admin/Reports";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="easypay-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OtpVerification />} />
                
                {/* Product Routes */}
                <Route path="/products" element={<ProductListing />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* Installment Routes */}
                <Route path="/installment-application" element={<InstallmentApplication />} />
                
                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                  <Route path="/dashboard" element={<CustomerDashboard />} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardFixed />} />
                  <Route path="/admin/customers" element={<AdminCustomers />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  {/* <Route path="/admin/dashboard-old" element={<AdminDashboard />} />
                  <Route path="/admin/debug" element={<AuthDebug />} /> */}
                </Route>
                
                {/* <Route path="/test-error" element={<div>Error test: {(() => { throw new Error('Test error'); })()}</div>} /> */}
                
                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
