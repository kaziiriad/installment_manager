
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/dashboard" element={<CustomerDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
