
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  Bell, 
  ShoppingCart, 
  User, 
  ChevronDown,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-brand-700">EasyPay</h1>
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-gray-900 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/products" className="text-gray-900 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                Products
              </Link>
              {user && (
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="text-gray-900 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
              )}
              <Link to="/about" className="text-gray-900 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-gray-900 hover:text-brand-600 px-3 py-2 text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center md:ml-6">
                <button className="p-2 text-gray-500 hover:text-brand-600 focus:outline-none">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="ml-3 p-2 text-gray-500 hover:text-brand-600 focus:outline-none">
                  <ShoppingCart className="h-5 w-5" />
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-3 flex items-center focus:outline-none">
                      <span className="mr-2 text-sm font-medium">{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-900 hover:text-brand-600">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="ml-3 bg-brand-600 hover:bg-brand-700 text-white">
                    Register
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-4">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-brand-600 hover:bg-gray-100 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md">
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md">
              Products
            </Link>
            {user && (
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md">
                Dashboard
              </Link>
            )}
            <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md">
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md">
              Contact
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-brand-600 rounded-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
