
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Phone,
  Smartphone,
  Laptop,
  Camera,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const Index = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Flexible Installment Plans for Your Dream Products
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                EasyPay makes premium products affordable through simple, transparent installment plans. Get what you need now and pay over time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-brand-600 hover:bg-brand-700 text-lg py-6 px-8">
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button variant="outline" className="text-lg py-6 px-8">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="w-full max-w-md">
              <div className="bg-white p-8 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get an iPhone 15 Pro</h2>
                <p className="text-gray-600 mb-4">Starting from BDT 15,833/month with 0% interest</p>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Price</span>
                    <span className="font-semibold">৳ 189,999</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment (20%)</span>
                    <span className="font-semibold">৳ 38,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-900 font-medium">Monthly Payment (12 months)</span>
                    <span className="text-brand-700 font-bold">৳ 12,667</span>
                  </div>
                </div>
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  <Link to="/products">View All Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EasyPay?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make premium products accessible through transparent installment plans with flexible terms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Installments</h3>
              <p className="text-gray-600">
                Choose from 3, 6, 9, or 12-month plans that fit your budget and lifestyle.
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Your financial information is always protected with bank-grade security.
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Approval</h3>
              <p className="text-gray-600">
                Get approved in minutes and receive your product within days.
              </p>
            </div>
            
            <div className="text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hidden Fees</h3>
              <p className="text-gray-600">
                Transparent pricing with no surprises or additional charges.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
              <p className="text-lg text-gray-600">
                Find the perfect product in our extensive collection.
              </p>
            </div>
            <Link 
              to="/products" 
              className="hidden md:flex items-center text-brand-600 hover:text-brand-700 font-medium"
            >
              View All Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <Link 
              to="/products?category=Smartphones" 
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-gray-900 font-medium">Smartphones</h3>
            </Link>
            
            <Link 
              to="/products?category=Laptops" 
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Laptop className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-gray-900 font-medium">Laptops</h3>
            </Link>
            
            <Link 
              to="/products?category=Cameras" 
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-gray-900 font-medium">Cameras</h3>
            </Link>
            
            <Link 
              to="/products?category=TVs" 
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <Tv className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-gray-900 font-medium">Televisions</h3>
            </Link>
            
            <Link 
              to="/products" 
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-gray-900 font-medium">All Categories</h3>
            </Link>
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Button variant="outline">
              <Link to="/products" className="flex items-center">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started with EasyPay installments is quick and simple.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 w-12 h-12 bg-brand-600 rounded-full text-white flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Your Product</h3>
              <p className="text-gray-600">
                Browse our extensive catalog and select the products that fit your needs.
              </p>
            </div>
            
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 w-12 h-12 bg-brand-600 rounded-full text-white flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Your Plan</h3>
              <p className="text-gray-600">
                Choose an installment plan that fits your budget and complete the application.
              </p>
            </div>
            
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 w-12 h-12 bg-brand-600 rounded-full text-white flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enjoy Your Purchase</h3>
              <p className="text-gray-600">
                Get approved quickly, receive your product, and make easy monthly payments.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-brand-600 hover:bg-brand-700">
              <Link to="/products">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0 md:max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to make your purchase more affordable?
              </h2>
              <p className="text-brand-100 text-lg">
                Join thousands of satisfied customers who enjoy premium products with manageable monthly payments.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-brand-600 hover:bg-gray-100">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-brand-700">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Hear from our satisfied customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww" 
                    alt="Customer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sarah Ahmed</h3>
                  <p className="text-gray-600 text-sm">Dhaka</p>
                </div>
              </div>
              <p className="text-gray-600">
                "EasyPay made it possible for me to get the new iPhone I really wanted. The process was simple, and the monthly payments are easy to manage."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww" 
                    alt="Customer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Rahim Khan</h3>
                  <p className="text-gray-600 text-sm">Chittagong</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I've been using EasyPay for all my major purchases. Their installment plans are transparent with no hidden fees. Highly recommended!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D" 
                    alt="Customer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Nadia Islam</h3>
                  <p className="text-gray-600 text-sm">Sylhet</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The customer dashboard makes it easy to track my payments. I love that I can see exactly how much I've paid and what's left at any time."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Have Questions?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our customer support team is here to help. Reach out with any questions or concerns.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-gray-700">+880 1234 567890</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-brand-600 mr-3">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span className="text-gray-700">support@easypay.com</span>
                </div>
              </div>
              <Button className="mt-8 bg-brand-600 hover:bg-brand-700">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">What documents do I need for application?</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    You'll need a valid ID, proof of income, and bank statements from the last 3 months.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">How long does approval take?</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Most applications are approved within 24 hours, and you'll receive your product within 2-3 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Can I pay off my installment early?</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Yes, you can pay off your remaining balance at any time without any early repayment fees.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="mt-6 w-full">
                <Link to="/faq">View All FAQs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Index;
